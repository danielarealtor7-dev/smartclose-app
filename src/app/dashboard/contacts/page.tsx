import { EmptyState } from '@/components/ui/EmptyState'
import { Users } from 'lucide-react'

export default function ContactsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-black tracking-tight">Contacts</h1>
        <p className="mt-1 text-sm text-text-muted">Manage realtors, title companies, lenders, and clients.</p>
      </div>
      <EmptyState 
        title="No contacts found"
        description="Build your network by adding frequently used realtors, title companies, and lenders."
        icon={Users}
        actionLabel="Add Contact"
      />
    </div>
  )
}
