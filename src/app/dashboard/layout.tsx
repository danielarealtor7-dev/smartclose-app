import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'

import { createClient } from '@/utils/supabase/server'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  let userName = ''
  
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('email')
      .eq('auth_id', user.id)
      .single()
      
    if (profile) {
      userName = (user.user_metadata?.full_name as string) || profile.email?.split('@')[0] || ''
    }
  }


  return (
    <div className="min-h-screen bg-bg-soft">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 md:pl-64">
        <Header userEmail={user?.email} userName={userName} />
        <main className="flex-1 overflow-auto">
          <div className="py-6 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
