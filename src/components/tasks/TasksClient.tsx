'use client'

import { useState } from 'react'
import { Clock, AlertTriangle, FileText, Check, Pencil, Trash2, CheckCircle2, Circle } from 'lucide-react'
import { TaskForm } from '@/components/tasks/TaskForm'
import { deleteTask, updateTaskStatus } from '@/app/actions/tasks'
import { Task } from '@/types'
import { useRouter } from 'next/navigation'

interface TaskItem extends Task {
  completed_by_user?: { name?: string | null } | null
}

export function TasksClient({ transactionId, initialTasks }: { transactionId: string, initialTasks: TaskItem[] }) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  // Group tasks by category or status
  const pendingTasks = initialTasks?.filter(t => t.status === 'PENDING' || t.status === 'IN_PROGRESS' || t.status === 'WAITING') || []
  const completedTasks = initialTasks?.filter(t => t.status === 'COMPLETED' || t.status === 'WAIVED') || []

  const handleToggleStatus = async (task: TaskItem) => {
    if (!task.id) return
    const nextStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED'
    setUpdatingId(task.id)
    setActionError(null)

    const res = await updateTaskStatus(task.id, transactionId, nextStatus)
    setUpdatingId(null)
    if (res.error) {
      setActionError(res.error)
    } else {
      router.refresh()
    }
  }

  const handleDelete = async (id?: string, title?: string) => {
    if (!id) return
    if (!window.confirm(`Are you sure you want to delete task "${title}"?`)) {
      return
    }

    setDeletingId(id)
    setActionError(null)

    const res = await deleteTask(id, transactionId)
    setDeletingId(null)
    if (res.error) {
      setActionError(res.error)
    } else {
      router.refresh()
    }
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PENDING': return <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-semibold">Pending</span>
      case 'IN_PROGRESS': return <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold">In Progress</span>
      case 'WAITING': return <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs font-semibold">Waiting On</span>
      case 'COMPLETED': return <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-semibold">Completed</span>
      case 'WAIVED': return <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs font-semibold">Waived</span>
      default: return <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-semibold">{status}</span>
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch(priority) {
      case 'HIGH': return <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
      case 'LOW': return <div className="w-2 h-2 rounded-full bg-blue-300 shrink-0" />
      default: return <div className="w-2 h-2 rounded-full bg-yellow-400 shrink-0" />
    }
  }

  const renderTask = (task: TaskItem) => {
    const isCompleted = task.status === 'COMPLETED'
    return (
      <div key={task.id} className="flex flex-col sm:flex-row gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 bg-white items-start sm:items-center">
        <button 
          onClick={() => handleToggleStatus(task)} 
          disabled={updatingId === task.id}
          className="mt-1 sm:mt-0 text-gray-400 hover:text-green-600 transition-colors disabled:opacity-50 shrink-0"
          title={isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          ) : (
            <Circle className="w-5 h-5 text-gray-300 hover:text-green-500" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {getPriorityIcon(task.priority)}
            <h4 className={`text-sm font-semibold truncate ${task.status === 'WAIVED' ? 'text-gray-400 line-through' : isCompleted ? 'text-gray-500 line-through' : 'text-brand-black'}`}>
              {task.title}
            </h4>
            {getStatusBadge(task.status)}
            {task.category && (
              <span className="text-xs text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">
                {task.category}
              </span>
            )}
          </div>
          
          {task.description && <p className="text-xs text-gray-600 mb-1 line-clamp-2">{task.description}</p>}
          {task.notes && <p className="text-xs text-gray-500 italic mb-1">&ldquo;{task.notes}&rdquo;</p>}
          
          <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted mt-1">
            {task.due_date && (
              <span className="flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5" /> Due: {task.due_date}
              </span>
            )}
            {task.waiting_on && (
              <span className="flex items-center gap-1 text-yellow-700 bg-yellow-50 px-1.5 py-0.5 rounded">
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

        <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
          <button 
            onClick={() => {
              setEditingTask(task)
              setShowForm(true)
            }}
            className="p-1.5 text-gray-500 hover:text-brand-black hover:bg-gray-100 rounded-md transition-colors"
            title="Edit Task"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleDelete(task.id, task.title)}
            disabled={deletingId === task.id}
            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
            title="Delete Task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-brand-black">Transaction Tasks</h2>
          <p className="text-sm text-text-muted mt-0.5">Manage checklists, deadlines, and pending items.</p>
        </div>
        <button 
          onClick={() => {
            setEditingTask(null)
            setShowForm(true)
          }}
          className="px-4 py-2 bg-brand-gold text-brand-black font-semibold rounded-lg hover:bg-brand-gold-hover transition-colors text-sm shadow-sm"
        >
          Add Task
        </button>
      </div>

      {actionError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="font-semibold text-xs ml-4 underline">Dismiss</button>
        </div>
      )}

      <div className="space-y-6">
        {pendingTasks.length > 0 && (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 font-semibold text-gray-700 flex justify-between items-center text-sm">
              <span>Action Required</span>
              <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-bold">{pendingTasks.length}</span>
            </div>
            <div className="divide-y divide-gray-100">
              {pendingTasks.map(renderTask)}
            </div>
          </div>
        )}

        {completedTasks.length > 0 && (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 font-semibold text-gray-700 flex justify-between items-center text-sm">
              <span>Completed & Waived</span>
              <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-bold">{completedTasks.length}</span>
            </div>
            <div className="divide-y divide-gray-100">
              {completedTasks.map(renderTask)}
            </div>
          </div>
        )}

        {initialTasks?.length === 0 && (
          <div className="p-8 text-center text-text-muted border border-dashed border-gray-300 rounded-xl bg-white">
            <FileText className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <h3 className="text-base font-semibold text-brand-black">No tasks found</h3>
            <p className="mt-1 text-sm">Tasks will appear here once generated from a template or added manually.</p>
          </div>
        )}
      </div>

      {showForm && (
        <TaskForm 
          transactionId={transactionId} 
          initialData={editingTask}
          onClose={() => {
            setShowForm(false)
            setEditingTask(null)
          }} 
          onSaved={() => router.refresh()}
        />
      )}
    </div>
  )
}

