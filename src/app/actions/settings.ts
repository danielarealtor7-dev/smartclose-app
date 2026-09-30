'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createTaskTemplate(formData: FormData) {
  const supabase = await createClient()

  // Ensure user is authenticated and get their org_id
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('users')
    .select('org_id')
    .eq('auth_id', userData.user.id)
    .single()

  if (!profile?.org_id) return { error: 'No organization found' }

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const transactionSide = formData.get('transaction_side') as string
  const financingType = formData.get('condition_financing_type') as string
  const propertyType = formData.get('condition_property_type') as string

  if (!name) return { error: 'Name is required' }

  const { data, error } = await supabase
    .from('task_templates')
    .insert([{
      org_id: profile.org_id,
      name,
      description: description || null,
      transaction_side: transactionSide || null,
      condition_financing_type: financingType || null,
      condition_property_type: propertyType || null
    }])
    .select()

  if (error) {
    console.error('Error creating task template:', error)
    return { error: 'Failed to create template' }
  }

  revalidatePath('/dashboard/settings')
  return { success: true, data }
}
