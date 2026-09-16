'use server'

import { createClient } from '@/utils/supabase/server'
import { TransactionSchema } from '@/types'
import { revalidatePath } from 'next/cache'

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
    return { error: 'Validation failed', details: validatedFields.error.flatten() }
  }

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      ...validatedFields.data,
      org_id: userData.org_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating transaction:', error)
    return { error: 'Failed to create transaction. Please try again.' }
  }

  revalidatePath('/dashboard/transactions')
  return { success: true, data }
}

export async function updateTransaction(id: string, formData: Record<string, unknown>) {
  const supabase = await createClient()
  
  const validatedFields = TransactionSchema.safeParse(formData)

  if (!validatedFields.success) {
    return { error: 'Validation failed', details: validatedFields.error.flatten() }
  }

  const { data, error } = await supabase
    .from('transactions')
    .update({
      ...validatedFields.data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: 'Failed to update transaction.' }
  }

  revalidatePath('/dashboard/transactions')
  revalidatePath(`/dashboard/transactions/${id}`)
  return { success: true, data }
}

export async function archiveTransaction(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('transactions')
    .update({
      is_archived: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    return { error: 'Failed to archive transaction.' }
  }

  revalidatePath('/dashboard/transactions')
  return { success: true }
}

export async function restoreTransaction(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('transactions')
    .update({
      is_archived: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    return { error: 'Failed to restore transaction.' }
  }

  revalidatePath('/dashboard/transactions')
  return { success: true }
}
