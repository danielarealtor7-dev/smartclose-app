import { EmptyState } from '@/components/ui/EmptyState'
import { Home } from 'lucide-react'

export default function TestShellPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-black tracking-tight">Today</h1>
        <p className="mt-1 text-sm text-text-muted">Overview of your pending tasks and transactions.</p>
      </div>
      <EmptyState 
        title="No tasks for today"
        description="You're all caught up! There are no pending tasks or contingencies expiring today."
        icon={Home}
      />
    </div>
  )
}
