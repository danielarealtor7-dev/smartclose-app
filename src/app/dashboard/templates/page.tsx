import { EmptyState } from '@/components/ui/EmptyState'
import { Files } from 'lucide-react'

export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-black tracking-tight">Email Templates</h1>
        <p className="mt-1 text-sm text-text-muted">Manage standard email templates for your communications.</p>
      </div>
      <EmptyState 
        title="No templates found"
        description="Create email templates to speed up communication with clients and agents."
        icon={Files}
        actionLabel="Create Template"
      />
    </div>
  )
}
