'use client'

import { useState } from 'react'
import { createTask, updateTask } from '@/app/actions/tasks'
import { X } from 'lucide-react'
import { useRouter } from 'next/navigation'

export interface TaskFormData {
  id?: string
  title: string
  description?: string | null
  due_date?: string | null
  status?: string
  priority?: string
  category?: string | null
  waiting_on?: string | null
  notes?: string | null
}

interface TaskFormProps {
  transactionId: string
  initialData?: TaskFormData | null
  onClose: () => void
  onSaved?: () => void
}

export function TaskForm({ transactionId, initialData, onClose, onSaved }: TaskFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const isEditing = Boolean(initialData?.id)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    
    const dueDateValue = formData.get('due_date') as string
    const dueDate = dueDateValue ? dueDateValue : null

    const data = {
      transaction_id: transactionId,
      title: formData.get('title') as string,
      description: (formData.get('description') as string) || null,
      due_date: dueDate,
      status: formData.get('status') as string,
      priority: formData.get('priority') as string,
      category: (formData.get('category') as string) || null,
      waiting_on: (formData.get('waiting_on') as string) || null,
      notes: (formData.get('notes') as string) || null,
    }

    const res = isEditing && initialData?.id
      ? await updateTask(initialData.id, transactionId, data)
      : await createTask(data)

    if (res.error) {
      setError(res.error)
      setIsSubmitting(false)
    } else {
      if (onSaved) onSaved()
      router.refresh()
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
          <h2 className="text-lg font-semibold text-brand-black">{isEditing ? 'Edit Task' : 'Add Task'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input 
              required 
              type="text" 
              name="title" 
              defaultValue={initialData?.title || ''} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              name="description" 
              defaultValue={initialData?.description || ''} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold" 
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input 
                type="date" 
                name="due_date" 
                defaultValue={initialData?.due_date || ''} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select 
                required 
                name="status" 
                defaultValue={initialData?.status || 'PENDING'} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold bg-white"
              >
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="WAITING">Waiting On</option>
                <option value="COMPLETED">Completed</option>
                <option value="WAIVED">Waived</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select 
                required 
                name="priority" 
                defaultValue={initialData?.priority || 'MEDIUM'} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold bg-white"
              >
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="LOW">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input 
                type="text" 
                name="category" 
                placeholder="e.g. Inspection" 
                defaultValue={initialData?.category || ''} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Waiting On (Optional)</label>
            <input 
              type="text" 
              name="waiting_on" 
              placeholder="e.g. Buyer's Agent" 
              defaultValue={initialData?.waiting_on || ''} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <textarea 
              name="notes" 
              placeholder="Internal notes for this task..." 
              defaultValue={initialData?.notes || ''} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold" 
              rows={2}
            />
          </div>
          
          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-brand-gold text-brand-black hover:bg-brand-gold-hover rounded-lg font-medium transition-colors disabled:opacity-50">
              {isSubmitting ? 'Saving...' : (isEditing ? 'Update Task' : 'Save Task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

