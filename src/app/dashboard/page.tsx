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
    <div className="min-h-screen bg-bg-soft flex flex-col md:flex-row">
      {/* Sidebar - Encabezado principal en #1A1A1A */}
      <aside className="w-full md:w-64 bg-brand-black text-white flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-800">
          <h1 className="text-xl font-bold text-white tracking-wide">
            Smart<span className="text-brand-gold">Close</span>
          </h1>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          <a href="#" className="flex items-center px-4 py-3 bg-white/10 text-brand-gold rounded-md border-l-4 border-brand-gold transition-colors font-medium">
            <Home className="mr-3 h-5 w-5" />
            Dashboard
          </a>
          <a href="#" className="flex items-center px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-white rounded-md transition-colors font-medium border-l-4 border-transparent">
            <FileText className="mr-3 h-5 w-5" />
            Documents
          </a>
          <a href="#" className="flex items-center px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-white rounded-md transition-colors font-medium border-l-4 border-transparent">
            <Settings className="mr-3 h-5 w-5" />
            Settings
          </a>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="px-4 py-2 mb-2">
            <span className="text-xs text-gray-400 block truncate">{user.email}</span>
          </div>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="flex w-full items-center px-4 py-2 text-sm font-medium text-gray-300 hover:text-brand-gold transition-colors"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 md:p-10">
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
      </main>
    </div>
  )
}
