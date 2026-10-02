'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getTransactionDates(transactionId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('transaction_dates')
    .select('*')
    .eq('transaction_id', transactionId)

  if (error) {
    console.error('Error fetching transaction dates:', error)
    return []
  }

  // Also include the Closing Date and Effective Date from the transactions table as fake 'dates'
  // Or better, let the client fetch the transaction and insert it into the list if needed.
  // Actually, wait, effective_date might already be stored as a transaction_date if it was created that way,
  // but if not, we should probably fetch the transaction to get effective_date and closing_date.
  
  const { data: tx } = await supabase
    .from('transactions')
    .select('closing_date, effective_date')
    .eq('id', transactionId)
    .single()

  const allDates: Array<Record<string, unknown>> = [...(data || [])]

  if (tx?.closing_date) {
    // Check if there is already a closing date in the transaction_dates table
    if (!allDates.find(d => d.type === 'CLOSING')) {
      allDates.push({
        id: `virtual-closing-${transactionId}`,
        transaction_id: transactionId,
        name: 'Closing Date',
        type: 'CLOSING',
        due_date: tx.closing_date,
        original_date: tx.closing_date,
        status: 'PENDING'
      })
    }
  }

  if (tx?.effective_date) {
    if (!allDates.find(d => d.type === 'EFFECTIVE_DATE')) {
      allDates.push({
        id: `virtual-effective-${transactionId}`,
        transaction_id: transactionId,
        name: 'Effective Date',
        type: 'EFFECTIVE_DATE',
        due_date: tx.effective_date,
        original_date: tx.effective_date,
        status: 'COMPLETED'
      })
    }
  }

  return allDates
}

export async function createTransactionDate(transactionId: string, data: Record<string, unknown>) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('transaction_dates')
    .insert({
      ...data,
      transaction_id: transactionId,
      status: 'PENDING',
      original_date: data.due_date
    })

  if (error) {
    console.error('Error creating date:', error)
    return { success: false, error: error.message }
  }

  revalidatePath(`/dashboard/transactions/${transactionId}/dates`)
  return { success: true }
}

export async function completeTransactionDate(id: string, transactionId: string) {
  const supabase = await createClient()

  if (id.startsWith('virtual-')) {
    // Cannot complete virtual dates directly through transaction_dates table
    return { success: true }
  }

  const { error } = await supabase
    .from('transaction_dates')
    .update({ status: 'COMPLETED' })
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath(`/dashboard/transactions/${transactionId}/dates`)
  return { success: true }
}

export async function waiveTransactionDate(id: string, transactionId: string) {
  const supabase = await createClient()

  if (id.startsWith('virtual-')) {
    return { success: true }
  }

  const { error } = await supabase
    .from('transaction_dates')
    .update({ status: 'WAIVED' })
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath(`/dashboard/transactions/${transactionId}/dates`)
  return { success: true }
}

export async function extendTransactionDate(id: string, transactionId: string, newDate: string, _reason: string) {
  void _reason
  const supabase = await createClient()

  if (id.startsWith('virtual-')) {
    // If we need to extend closing date, we update the transactions table
    if (id.startsWith('virtual-closing-')) {
      await supabase.from('transactions').update({ closing_date: newDate }).eq('id', transactionId)
    } else if (id.startsWith('virtual-effective-')) {
      await supabase.from('transactions').update({ effective_date: newDate }).eq('id', transactionId)
    }
    revalidatePath(`/dashboard/transactions/${transactionId}/dates`)
    return { success: true }
  }

  // Update original date to EXTENDED and new due_date
  // But wait, the schema doesn't have a reason column. We can just add it to notes if it exists, or just set due_date and status.
  const { error } = await supabase
    .from('transaction_dates')
    .update({ 
      status: 'EXTENDED', 
      due_date: newDate 
    })
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath(`/dashboard/transactions/${transactionId}/dates`)
  return { success: true }
}
