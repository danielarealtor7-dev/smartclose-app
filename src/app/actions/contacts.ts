'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getContactsByRole(roleType: string) {
  const supabase = await createClient()

  // Get user's org
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Unauthorized' }
  const { data: userData } = await supabase.from('users').select('org_id').eq('auth_id', user.id).single()
  if (!userData?.org_id) return { data: null, error: 'No org found' }

  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('org_id', userData.org_id)
    .eq('role_type', roleType)
    .order('first_name', { ascending: true })

  return { data, error: error?.message }
}

export async function updateContact(id: string, contactData: { first_name: string, last_name: string, role_type: string, email?: string, phone?: string }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Unauthorized' }
  const { data: userData } = await supabase.from('users').select('org_id').eq('auth_id', user.id).single()
  if (!userData?.org_id) return { data: null, error: 'No org found' }

  const { data, error } = await supabase
    .from('contacts')
    .update({
      ...contactData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('org_id', userData.org_id)
    .select()
    .single()

  if (error) {
    console.error('Update contact error:', error)
    return { data: null, error: 'Failed to update contact' }
  }

  revalidatePath('/dashboard/contacts')
  return { data, error: null }
}

export async function deleteContact(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }
  const { data: userData } = await supabase.from('users').select('org_id').eq('auth_id', user.id).single()
  if (!userData?.org_id) return { error: 'No org found' }

  const { error } = await supabase
    .from('contacts')
    .delete()
    .eq('id', id)
    .eq('org_id', userData.org_id)

  if (error) {
    console.error('Delete contact error:', error)
    return { error: 'Failed to delete contact. It may be linked to an active transaction.' }
  }

  revalidatePath('/dashboard/contacts')
  return { error: null }
}

export async function createContact(contactData: { first_name: string, last_name: string, role_type: string, email?: string, phone?: string }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Unauthorized' }
  const { data: userData } = await supabase.from('users').select('org_id').eq('auth_id', user.id).single()
  if (!userData?.org_id) return { data: null, error: 'No org found' }

  const { data, error } = await supabase
    .from('contacts')
    .insert({
      ...contactData,
      org_id: userData.org_id,
      created_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('Create contact error:', error)
    return { data: null, error: 'Failed to create contact' }
  }

  revalidatePath('/dashboard/contacts')
  return { data, error: null }
}
export async function getAllContacts() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Unauthorized' }
  const { data: userData } = await supabase.from('users').select('org_id').eq('auth_id', user.id).single()
  if (!userData?.org_id) return { data: null, error: 'No org found' }

  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('org_id', userData.org_id)
    .order('first_name', { ascending: true })

  return { data, error: error?.message }
}
