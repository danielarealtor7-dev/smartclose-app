'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import type { Task } from '@/types'

interface TaskFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: Record<string, unknown>) => void
  initialData?: Partial<Task>
}

export function TaskForm({ isOpen, onClose, onSave, initialData }: TaskFormProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [dueDate, setDueDate] = useState(initialData?.due_date || '')
  const [waitingOn, setWaitingOn] = useState(initialData?.waiting_on || '')
  const [category, setCategory] = useState(initialData?.category || '')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      title,
      description,
      due_date: dueDate || null,
      waiting_on: waitingOn || null,
      category: category || null,
      status: initialData?.status || 'TODO'
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-brand-black">
            {initialData ? 'Edit Task' : 'Add Task'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Title *</label>
            <input 
              required
              value={title} onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-gold focus:border-brand-gold"
              placeholder="e.g. Schedule Inspection"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Description</label>
            <textarea 
              value={description} onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-gold focus:border-brand-gold"
              rows={3}
              placeholder="Any additional details..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Due Date</label>
              <input 
                type="date"
                value={dueDate} onChange={e => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-gold focus:border-brand-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Category</label>
              <select
                value={category} onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-gold focus:border-brand-gold"
              >
                <option value="">None</option>
                <option value="INSPECTION">Inspection</option>
                <option value="FINANCING">Financing</option>
                <option value="CLOSING">Closing</option>
                <option value="GENERAL">General</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Waiting On (Blocker)</label>
            <input 
              value={waitingOn} onChange={e => setWaitingOn(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-gold focus:border-brand-gold"
              placeholder="e.g. Lender, Buyer, Title Company"
            />
          </div>

          <div className="pt-4 flex justify-end space-x-3 border-t">
            <button 
              type="button" onClick={onClose}
              className="px-4 py-2 text-text-main bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 text-brand-black font-medium bg-brand-gold rounded-lg hover:bg-brand-gold-hover transition-colors"
            >
              Save Task
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
