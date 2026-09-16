import { EmptyState } from '@/components/ui/EmptyState'
import { FolderClosed } from 'lucide-react'

export default function ArchivePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-black tracking-tight">Archive</h1>
        <p className="mt-1 text-sm text-text-muted">Access your closed, cancelled, or inactive transactions.</p>
      </div>
      <EmptyState 
        title="Archive is empty"
        description="When a transaction is closed or cancelled, it will be moved here for your records."
        icon={FolderClosed}
      />
    </div>
  )
}
