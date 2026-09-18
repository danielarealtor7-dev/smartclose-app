import { createClient } from '@/utils/supabase/server'
import { Settings, FileText } from 'lucide-react'

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-black tracking-tight">Settings & Templates</h1>
        <p className="mt-1 text-sm text-text-muted">Manage your organization templates and conditional logic.</p>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-brand-black flex items-center">
            <FileText className="w-5 h-5 mr-2 text-brand-gold" />
            Task Templates
          </h2>
          <button className="px-4 py-2 text-sm font-medium bg-brand-gold text-brand-black rounded-lg hover:bg-gold-hover transition-colors">
            New Template
          </button>
        </div>
        <div className="p-0">
          {templates.length === 0 ? (
            <div className="p-8 text-center text-text-muted">
              No templates found. Run the seed script or create one.
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {templates.map((t: any) => (
                <li key={t.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-brand-black">{t.name}</h3>
                      <p className="text-sm text-text-muted mt-1">{t.description}</p>
                      
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {t.transaction_side && (
                          <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-100">
                            Side: {t.transaction_side}
                          </span>
                        )}
                        {t.condition_financing_type && (
                          <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-md border border-green-100">
                            Financing: {t.condition_financing_type}
                          </span>
                        )}
                        {t.condition_property_type && (
                          <span className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded-md border border-purple-100">
                            Property: {t.condition_property_type}
                          </span>
                        )}
                      </div>
                    </div>
                    <button className="text-sm text-brand-gold hover:underline font-medium">
                      Edit Items
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
