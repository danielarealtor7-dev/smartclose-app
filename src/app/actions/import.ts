'use server'

import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const RowSchema = z.object({
  clientName: z.string().optional(),
  propertyAddress: z.string().optional(),
  realtor: z.string().optional(),
  effectiveDay: z.string().optional(),
  closingDay: z.string().optional(),
  loanType: z.string().optional(),
  
  ebba: z.string().optional(),
  contract: z.string().optional(),
  fhaVa: z.string().optional(),
  compensation: z.string().optional(),
  escrow: z.string().optional(),
  lbpDisc: z.string().optional(),
  floodDisc: z.string().optional(),
  mlsProfile: z.string().optional(),
  spd: z.string().optional(),
  addendum: z.string().optional(),
  inspection: z.string().optional(),
  
  importRowNumber: z.number()
})

type Row = z.infer<typeof RowSchema>

interface ImportBatchData {
  filename: string;
  worksheet: string;
  rows: Row[];
}

function parseBool(val?: string) {
  if (!val) return false
  return val.toLowerCase() === 'true'
}

export async function processImportBatch(batchData: ImportBatchData) {
  const supabase = await createClient()

  // 1. Get user and org
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('users')
    .select('org_id, id')
    .eq('auth_id', userData.user.id)
    .single()

  if (!profile?.org_id) throw new Error('Organization not found')
  const orgId = profile.org_id
  const userId = profile.id 

  // 2. Create the import batch
  const { data: batch, error: batchError } = await supabase
    .from('import_batches')
    .insert({
      org_id: orgId,
      filename: batchData.filename,
      worksheet: batchData.worksheet,
      total_rows: batchData.rows.length,
      imported_rows: 0,
      status: 'COMPLETED',
      created_by: userId
    })
    .select('id')
    .single()

  if (batchError) {
    console.error('Error creating import batch:', batchError)
    throw new Error('Failed to create import batch')
  }

  const batchId = batch.id
  let importedCount = 0

  // 3. Process each row
  for (const row of batchData.rows) {
    // Basic rules check (should already be done on client, but re-validate)
    if (!row.clientName && !row.propertyAddress) continue

    const propertyType = 'SINGLE_FAMILY' // Default
    let financingType = 'CONVENTIONAL' // Default
    if (row.loanType?.toLowerCase().includes('cash')) financingType = 'CASH'
    if (row.loanType?.toLowerCase().includes('fha')) financingType = 'FHA'
    if (row.loanType?.toLowerCase().includes('va')) financingType = 'VA'

    // Insert transaction
    const { data: tx, error: txError } = await supabase
      .from('transactions')
      .insert({
        org_id: orgId,
        buyer_names: row.clientName || null,
        property_address: row.propertyAddress || 'Unknown Address',
        property_type: propertyType,
        financing_type: financingType,
        transaction_side: 'BUYER', // Default assumption
        effective_date: row.effectiveDay || null,
        closing_date: row.closingDay || null,
        import_batch_id: batchId,
        import_row_number: row.importRowNumber
      })
      .select('id')
      .single()

    if (txError) {
      console.error('Error inserting transaction:', txError)
      continue // Skip partial errors
    }

    importedCount++

    // Insert Checkbox Tasks
    const taskMapping = [
      { key: 'ebba', name: 'EBBA' },
      { key: 'contract', name: 'Contract' },
      { key: 'fhaVa', name: 'FHA/VA' },
      { key: 'compensation', name: 'Compensation' },
      { key: 'escrow', name: 'Escrow' },
      { key: 'lbpDisc', name: 'LBP Disc' },
      { key: 'floodDisc', name: 'Flood Disc' },
      { key: 'mlsProfile', name: 'MLS Profile' },
      { key: 'spd', name: 'SPD' },
      { key: 'addendum', name: 'Addendum' },
      { key: 'inspection', name: 'Inspection' }
    ]

    const tasksToInsert = []
    for (const mapping of taskMapping) {
      const val = row[mapping.key as keyof Row] as string | undefined
      if (val !== undefined) {
        const isCompleted = parseBool(val)
        tasksToInsert.push({
          transaction_id: tx.id,
          name: mapping.name,
          category: 'Other',
          status: isCompleted ? 'COMPLETED' : 'PENDING',
          priority: 'MEDIUM',
          is_archived: false
        })
      }
    }

    if (tasksToInsert.length > 0) {
      await supabase.from('transaction_tasks').insert(tasksToInsert)
    }
  }

  // Update batch with imported count
  await supabase
    .from('import_batches')
    .update({ imported_rows: importedCount })
    .eq('id', batchId)

  return { success: true, batchId, importedCount }
}

export async function undoImportBatch(batchId: string) {
  const supabase = await createClient()

  // 1. Get the batch
  const { data: batch, error: batchError } = await supabase
    .from('import_batches')
    .select('*')
    .eq('id', batchId)
    .single()

  if (batchError || !batch) throw new Error('Batch not found')
  if (batch.status === 'UNDONE') throw new Error('Batch already undone')

  // 2. Fetch all transactions for this batch
  const { data: txs, error: txError } = await supabase
    .from('transactions')
    .select('id, created_at, updated_at')
    .eq('import_batch_id', batchId)

  if (txError) throw new Error('Failed to fetch transactions')

  // Check if any transaction has been edited (updated_at > created_at)
  const modifiedTxs = txs.filter(tx => {
    const created = new Date(tx.created_at).getTime()
    const updated = new Date(tx.updated_at).getTime()
    return (updated - created) > 5000 
  })

  if (modifiedTxs.length > 0) {
    throw new Error('Cannot undo this import batch. Some records have already been edited manually.')
  }

  // 3. Delete transactions
  const { error: deleteError } = await supabase
    .from('transactions')
    .delete()
    .eq('import_batch_id', batchId)

  if (deleteError) throw new Error('Failed to delete transactions')

  // 4. Mark batch as UNDONE
  await supabase
    .from('import_batches')
    .update({ status: 'UNDONE', imported_rows: 0 })
    .eq('id', batchId)

  return { success: true }
}





interface PreviewRowData {
  clientName?: string
  propertyAddress?: string
  effectiveDay?: string
  index: number
}

export async function previewImportBatch(rows: PreviewRowData[]) {
  const supabase = await createClient()

  // 1. Get user and org
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('users')
    .select('org_id')
    .eq('auth_id', userData.user.id)
    .single()

  if (!profile?.org_id) throw new Error('Organization not found')
  const orgId = profile.org_id

  // 2. Fetch all existing transactions for this org to compare
  const { data: existingTxs } = await supabase
    .from('transactions')
    .select('id, buyer_names, property_address, effective_date')
    .eq('org_id', orgId)

  const existingTxsClean = (existingTxs || []).map(tx => ({
    id: tx.id,
    buyer: (tx.buyer_names || '').toLowerCase().trim(),
    address: (tx.property_address || '').toLowerCase().trim(),
    date: tx.effective_date
  }))

  const results = rows.map(row => {
    const rBuyer = (row.clientName || '').toLowerCase().trim()
    const rAddress = (row.propertyAddress || '').toLowerCase().trim()
    const rDate = row.effectiveDay

    // Rule: Ignore if no client and no address
    if (!rBuyer && !rAddress) {
      return { index: row.index, classification: 'Ignored', reason: 'Missing both Client Name and Property Address' }
    }

    // Find matches
    const exactMatch = existingTxsClean.find(tx => tx.buyer === rBuyer && tx.address === rAddress && tx.date === rDate)
    if (exactMatch) {
      // It's a duplicate. If it's a re-import we might say 'Changed' if other fields changed, but for now 'Possible Duplicate'
      return { index: row.index, classification: 'Possible Duplicate', reason: 'An exact match exists in the database' }
    }

    const partialMatch = existingTxsClean.find(tx => tx.address === rAddress)
    if (partialMatch) {
       return { index: row.index, classification: 'Possible Duplicate', reason: 'A transaction with this address already exists' }
    }

    return { index: row.index, classification: 'New' }
  })

  return results
}
