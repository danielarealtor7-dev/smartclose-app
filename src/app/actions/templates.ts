'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createEmailTemplate(formData: FormData) {
  const supabase = await createClient()

  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('users')
    .select('org_id')
    .eq('auth_id', userData.user.id)
    .single()

  if (!profile?.org_id) return { error: 'No organization found' }

  const name = formData.get('name') as string
  const subject = formData.get('subject') as string
  const body = formData.get('body') as string

  if (!name || !subject || !body) return { error: 'All fields are required' }

  const { data, error } = await supabase
    .from('email_templates')
    .insert([{
      org_id: profile.org_id,
      name,
      subject,
      body
    }])
    .select()

  if (error) {
    console.error('Error creating email template:', error)
    return { error: 'Failed to create template' }
  }

  revalidatePath('/dashboard/templates')
  return { success: true, data }
}
