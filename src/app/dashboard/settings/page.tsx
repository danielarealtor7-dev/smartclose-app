/* eslint-disable */
import { createClient } from '@/utils/supabase/server'
import { SettingsClient } from '@/components/settings/SettingsClient'

export default async function SettingsPage() {
  const supabase = await createClient()

  // 1. Get user org
  const { data: userData } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('users').select('org_id').eq('auth_id', userData?.user?.id).single()

  let templates = []
  if (profile?.org_id) {
    const { data } = await supabase.from('task_templates').select('*').eq('org_id', profile.org_id).order('created_at')
    if (data) templates = data
  }

  return (
    <SettingsClient initialTemplates={templates} />
  )
}
