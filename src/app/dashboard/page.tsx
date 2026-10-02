import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { LogOut, Home, FileText, Settings } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div>
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-brand-black">Overview</h2>
        <p className="text-sm text-text-muted mt-1">Welcome back to the secure portal.</p>
      </header>

      {/* Cards en blanco */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border-t-2 border-brand-gold">
          <h3 className="text-text-main font-semibold text-sm">Active Deals</h3>
          <p className="text-3xl font-bold text-brand-black mt-2">12</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-text-main font-semibold text-sm">Pending Signatures</h3>
          <p className="text-3xl font-bold text-brand-black mt-2">4</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-text-main font-semibold text-sm">Action Required</h3>
          <p className="text-3xl font-bold text-danger mt-2">1</p>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-brand-black mb-4">Recent Activity</h3>
        <p className="text-text-muted text-sm">
          Data accessed here is protected by Supabase Row Level Security (RLS).
        </p>
      </div>
    </div>
  )
}
