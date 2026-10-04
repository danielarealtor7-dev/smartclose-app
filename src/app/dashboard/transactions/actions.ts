'use server'

import { createClient } from '@/utils/supabase/server'
import { TransactionSchema } from '@/types'
import { revalidatePath } from 'next/cache'

function sanitizeTransactionFields(data: Record<string, unknown>) {
  const sanitized: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(data)) {
    if (value === '' || value === undefined) {
      sanitized[key] = null
    } else {
      sanitized[key] = value
    }
  }
  return sanitized
}

export async function createTransaction(formData: Record<string, unknown>) {
  const supabase = await createClient()

  // Verify org_id
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Get user's org
  const { data: userData } = await supabase.from('users').select('org_id').eq('auth_id', user.id).single()
  if (!userData?.org_id) return { error: 'No organization found' }

  // Validate form data
  const validatedFields = TransactionSchema.safeParse(formData)

  if (!validatedFields.success) {
    const errorMsg = Object.values(validatedFields.error.flatten().fieldErrors).flat().join(', ')
    return { error: errorMsg || 'Validation failed', details: validatedFields.error.flatten() }
  }

  const payload = sanitizeTransactionFields(validatedFields.data)

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      ...payload,
      org_id: userData.org_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating transaction:', error)
    return { error: error.message || 'Failed to create transaction. Please try again.' }
  }

  revalidatePath('/dashboard/transactions')
  return { success: true, data }
}

export async function updateTransaction(id: string, formData: Record<string, unknown>) {
  const supabase = await createClient()
  
  const validatedFields = TransactionSchema.safeParse(formData)

  if (!validatedFields.success) {
    const errorMsg = Object.values(validatedFields.error.flatten().fieldErrors).flat().join(', ')
    return { error: errorMsg || 'Validation failed', details: validatedFields.error.flatten() }
  }

  const payload = sanitizeTransactionFields(validatedFields.data)

  const { data, error } = await supabase
    .from('transactions')
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating transaction:', error)
    return { error: error.message || 'Failed to update transaction.' }
  }

  revalidatePath('/dashboard/transactions')
  revalidatePath(`/dashboard/transactions/${id}`)
  return { success: true, data }
}


export async function archiveTransaction(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }
  const { data: userData } = await supabase.from('users').select('org_id').eq('auth_id', user.id).single()
  if (!userData?.org_id) return { error: 'No organization found' }

  const { error } = await supabase
    .from('transactions')
    .update({
      is_archived: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('org_id', userData.org_id)

  if (error) {
    console.error('Error archiving transaction:', error)
    return { error: error.message || 'Failed to archive transaction.' }
  }

  revalidatePath('/dashboard/transactions')
  revalidatePath('/dashboard/archive')
  revalidatePath(`/dashboard/transactions/${id}`)
  return { success: true }
}

export async function restoreTransaction(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }
  const { data: userData } = await supabase.from('users').select('org_id').eq('auth_id', user.id).single()
  if (!userData?.org_id) return { error: 'No organization found' }

  const { error } = await supabase
    .from('transactions')
    .update({
      is_archived: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('org_id', userData.org_id)

  if (error) {
    console.error('Error restoring transaction:', error)
    return { error: error.message || 'Failed to restore transaction.' }
  }

  revalidatePath('/dashboard/transactions')
  revalidatePath('/dashboard/archive')
  revalidatePath(`/dashboard/transactions/${id}`)
  return { success: true }
}


export async function deleteTransaction(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }
  const { data: userData } = await supabase.from('users').select('org_id').eq('auth_id', user.id).single()
  if (!userData?.org_id) return { error: 'No organization found' }

  // Delete child records first to ensure clean cascade
  await supabase.from('tasks').delete().eq('transaction_id', id)
  await supabase.from('transaction_dates').delete().eq('transaction_id', id)
  await supabase.from('communication_logs').delete().eq('transaction_id', id)

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('org_id', userData.org_id)

  if (error) {
    console.error('Error deleting transaction:', error)
    return { error: 'Failed to delete transaction.' }
  }

  revalidatePath('/dashboard/transactions')
  return { success: true }
}

