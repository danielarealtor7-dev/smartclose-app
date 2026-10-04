'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export interface DocumentItem {
  id: string
  transaction_id: string
  file_name: string
  file_path: string
  uploaded_by?: string | null
  uploaded_at: string
}

export async function getTransactionDocuments(transactionId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('transaction_id', transactionId)
    .order('uploaded_at', { ascending: false })

  if (error) {
    console.error('Error fetching documents:', error)
    return { data: [], error: error.message }
  }

  return { data: (data as DocumentItem[]) || [], error: null }
}

export async function createDocument(
  transactionId: string, 
  data: { 
    file_name: string
    file_path: string 
  }
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: profile } = await supabase
    .from('users')
    .select('id, org_id')
    .eq('auth_id', user.id)
    .single()

  if (!profile) return { error: 'User profile not found' }

  // Verify transaction belongs to user's org
  const { data: tx } = await supabase
    .from('transactions')
    .select('id')
    .eq('id', transactionId)
    .eq('org_id', profile.org_id)
    .single()

  if (!tx) return { error: 'Transaction not found in your organization' }

  const { data: newDoc, error } = await supabase
    .from('documents')
    .insert({
      transaction_id: transactionId,
      file_name: data.file_name.trim(),
      file_path: data.file_path.trim(),
      uploaded_by: profile.id,
      uploaded_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating document:', error)
    return { error: error.message }
  }

  revalidatePath(`/dashboard/transactions/${transactionId}/documents`)
  return { success: true, data: newDoc }
}

export async function deleteDocument(documentId: string, transactionId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: profile } = await supabase
    .from('users')
    .select('id, org_id')
    .eq('auth_id', user.id)
    .single()

  if (!profile) return { error: 'User profile not found' }

  // Verify transaction belongs to user's org
  const { data: tx } = await supabase
    .from('transactions')
    .select('id')
    .eq('id', transactionId)
    .eq('org_id', profile.org_id)
    .single()

  if (!tx) return { error: 'Transaction not found in your organization' }

  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', documentId)
    .eq('transaction_id', transactionId)

  if (error) {
    console.error('Error deleting document:', error)
    return { error: error.message }
  }

  revalidatePath(`/dashboard/transactions/${transactionId}/documents`)
  return { success: true }
}
