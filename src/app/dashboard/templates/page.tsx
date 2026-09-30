import { createClient } from '@/utils/supabase/server'
import { TemplatesClient } from '@/components/templates/TemplatesClient'

export default async function TemplatesPage() {
  const supabase = await createClient()

  const { data: userData } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('users').select('org_id').eq('auth_id', userData?.user?.id).single()

  let templates = []
  if (profile?.org_id) {
    const { data } = await supabase.from('email_templates').select('*').eq('org_id', profile.org_id).order('created_at')
    if (data) templates = data
  }

  return <TemplatesClient initialTemplates={templates} />
}
