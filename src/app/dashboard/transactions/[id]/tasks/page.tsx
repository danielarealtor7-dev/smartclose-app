import { createClient } from '@/utils/supabase/server'
import { CheckCircle2, Clock, AlertTriangle, User, MoreHorizontal, FileText, Check } from 'lucide-react'

export default async function TasksPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const supabase = await createClient()

  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('*, completed_by_user:users!tasks_completed_by_fkey(name)')
    .eq('transaction_id', resolvedParams.id)
    .order('due_date', { ascending: true })

  if (error) {
    return <div className="p-4 text-red-500">Error loading tasks: {error.message}</div>
  }

  // Group tasks by category or status
  const pendingTasks = tasks?.filter(t => t.status === 'PENDING' || t.status === 'IN_PROGRESS' || t.status === 'WAITING') || []
  const completedTasks = tasks?.filter(t => t.status === 'COMPLETED' || t.status === 'WAIVED') || []

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PENDING': return <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-semibold">Pending</span>
      case 'IN_PROGRESS': return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs font-semibold">In Progress</span>
      case 'WAITING': return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-md text-xs font-semibold">Waiting On</span>
      case 'COMPLETED': return <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs font-semibold">Completed</span>
      case 'WAIVED': return <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-md text-xs font-semibold">Waived</span>
      default: return <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-semibold">{status}</span>
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch(priority) {
      case 'HIGH': return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'LOW': return <div className="w-2 h-2 rounded-full bg-blue-300" />
      default: return <div className="w-2 h-2 rounded-full bg-yellow-400" />
    }
  }

  const renderTask = (task: any) => (
    <div key={task.id} className="flex flex-col sm:flex-row gap-4 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 bg-white">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          {getPriorityIcon(task.priority)}
          <h4 className={`text-base font-medium ${task.status === 'WAIVED' ? 'text-gray-400 line-through' : 'text-brand-black'}`}>
            {task.title}
          </h4>
          {getStatusBadge(task.status)}
          {task.category && (
            <span className="text-xs text-gray-500 border border-gray-200 px-2 py-0.5 rounded-full ml-2">
              {task.category}
            </span>
          )}
        </div>
        
        {task.description && <p className="text-sm text-gray-600 mb-2">{task.description}</p>}
        {task.notes && <p className="text-sm text-gray-500 italic mb-2">"{task.notes}"</p>}
        
        <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted">
          {task.due_date && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Due: {task.due_date}
            </span>
          )}
          {task.waiting_on && (
            <span className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded">
              Waiting on: {task.waiting_on}
            </span>
          )}
          {task.completed_at && (
            <span className="flex items-center gap-1 text-green-600">
              <Check className="w-3.5 h-3.5" /> Completed: {new Date(task.completed_at).toLocaleDateString()}
              {task.completed_by_user?.name && ` by ${task.completed_by_user.name}`}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="text-gray-400 hover:text-brand-black p-1 border border-gray-200 rounded">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
    </div>
  )

  return (
    <div className="max-w-5xl space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-brand-black">Transaction Tasks</h2>
          <p className="text-sm text-text-muted mt-1">Manage checklists and pending items.</p>
        </div>
        <button className="px-4 py-2 bg-brand-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors text-sm">
          Add Task
        </button>
      </div>

      <div className="space-y-6">
        {pendingTasks.length > 0 && (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 font-semibold text-gray-700">
              Action Required ({pendingTasks.length})
            </div>
            <div className="divide-y divide-gray-100">
              {pendingTasks.map(renderTask)}
            </div>
          </div>
        )}

        {completedTasks.length > 0 && (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 font-semibold text-gray-700">
              Completed & Waived ({completedTasks.length})
            </div>
            <div className="divide-y divide-gray-100">
              {completedTasks.map(renderTask)}
            </div>
          </div>
        )}

        {tasks?.length === 0 && (
          <div className="p-8 text-center text-text-muted border border-dashed border-gray-300 rounded-xl">
            <FileText className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <h3 className="text-lg font-medium text-brand-black">No tasks found</h3>
            <p className="mt-1">Tasks will appear here once generated from a template or added manually.</p>
          </div>
        )}
      </div>
    </div>
  )
}
