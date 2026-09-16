import { EmptyState } from '@/components/ui/EmptyState'
import { Settings } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-black tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-text-muted">Manage your profile, preferences, and system settings.</p>
      </div>
      <EmptyState 
        title="Settings coming soon"
        description="Configuration for your account, MFA, and organization will be available here."
        icon={Settings}
      />
    </div>
  )
}
