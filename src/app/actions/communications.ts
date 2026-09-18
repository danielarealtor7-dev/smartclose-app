'use server'

import { createClient } from '@/utils/supabase/server'
import { CommunicationLog } from '@/types'
import { revalidatePath } from 'next/cache'

export async function getEmailTemplates() {
  const supabase = await createClient()

  // In a real app we'd get org_id from the session, for now just fetch all
  // since we only seeded one org.
  const { data: templates, error } = await supabase
    .from('email_templates')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching email templates:', error)
    return { templates: [], error: error.message }
  }

  return { templates, error: null }
}

export async function createCommunicationLog(logData: Partial<CommunicationLog>) {
  const supabase = await createClient()

  const { data: userData } = await supabase.auth.getUser()

  const newLog = {
    ...logData,
    user_id: userData?.user?.id || logData.user_id,
  }

  const { data, error } = await supabase
    .from('communication_logs')
    .insert(newLog)
    .select()
    .single()

  if (error) {
    console.error('Error creating communication log:', error)
    return { log: null, error: error.message }
  }

  revalidatePath(`/dashboard/transactions/${logData.transaction_id}/communication`)
  return { log: data, error: null }
}
