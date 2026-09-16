'use server'

import { createClient } from '@/utils/supabase/server'
import { TransactionDateSchema, DeadlineChangeSchema } from '@/types'
import { revalidatePath } from 'next/cache'

export async function createTransactionDate(formData: Record<string, unknown>) {
  const supabase = await createClient()

  const validatedFields = TransactionDateSchema.safeParse(formData)

  if (!validatedFields.success) {
    return { error: 'Validation failed', details: validatedFields.error.flatten() }
  }

  const { data, error } = await supabase
    .from('transaction_dates')
    .insert({
      ...validatedFields.data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    return { error: 'Failed to create date.' }
  }

  revalidatePath(`/dashboard/transactions/${validatedFields.data.transaction_id}/dates`)
  return { success: true, data }
}

export async function updateDateStatus(id: string, transactionId: string, status: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('transaction_dates')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    return { error: 'Failed to update date status.' }
  }

  revalidatePath(`/dashboard/transactions/${transactionId}/dates`)
  return { success: true }
}

export async function extendTransactionDate(formData: Record<string, unknown>, transactionId: string) {
  const supabase = await createClient()

  const validatedFields = DeadlineChangeSchema.safeParse(formData)
  if (!validatedFields.success) {
    return { error: 'Validation failed', details: validatedFields.error.flatten() }
  }

  // We need to use a transaction or RPC ideally, but for now we do it sequentially
  // 1. Insert deadline_change
  const { error: changeError } = await supabase
    .from('deadline_changes')
    .insert({
      ...validatedFields.data,
      created_at: new Date().toISOString(),
    })

  if (changeError) {
    return { error: 'Failed to record deadline change.' }
  }

  // 2. Update transaction_dates
  const { error: updateError } = await supabase
    .from('transaction_dates')
    .update({
      due_date: validatedFields.data.new_date,
      status: 'EXTENDED',
      updated_at: new Date().toISOString(),
    })
    .eq('id', validatedFields.data.transaction_date_id)

  if (updateError) {
    return { error: 'Failed to update transaction date. Data might be out of sync.' }
  }

  revalidatePath(`/dashboard/transactions/${transactionId}/dates`)
  return { success: true }
}
