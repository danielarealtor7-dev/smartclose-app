'use client'

import { X } from 'lucide-react'

interface TasksDiffModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  diff: {
    added: any[]
    unchanged: any[]
    removed: any[]
  } | null
  isApplying: boolean
}

export function TasksDiffModal({ isOpen, onClose, onConfirm, diff, isApplying }: TasksDiffModalProps) {
  if (!isOpen || !diff) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-brand-black">
            Transaction Details Changed
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <p className="text-sm text-text-muted">
            The changes you made to the transaction side, property type, or financing type affect the required task templates. Please review the changes below.
          </p>

          {diff.added.length > 0 && (
            <div>
              <h3 className="font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-md mb-2">
                New Tasks (To be Added)
              </h3>
              <ul className="space-y-2 pl-2">
                {diff.added.map((task, i) => (
                  <li key={i} className="text-sm flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    {task.title} <span className="text-gray-400 ml-1">({task.category})</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {diff.removed.length > 0 && (
            <div>
              <h3 className="font-semibold text-orange-700 bg-orange-50 px-3 py-1 rounded-md mb-2">
                No Longer Applicable (Will be Waived)
              </h3>
              <p className="text-xs text-orange-600 mb-2 pl-2">
                * Note: History and previous checkmarks are not deleted. These will just be marked as Waived.
              </p>
              <ul className="space-y-2 pl-2">
                {diff.removed.map((task, i) => (
                  <li key={i} className="text-sm flex items-center text-gray-500 line-through">
                    <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                    {task.title}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {diff.unchanged.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-700 bg-gray-50 px-3 py-1 rounded-md mb-2">
                Unchanged Tasks
              </h3>
              <ul className="space-y-1 pl-2">
                {diff.unchanged.map((task, i) => (
                  <li key={i} className="text-sm text-gray-500">
                    • {task.title}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {diff.added.length === 0 && diff.removed.length === 0 && (
             <div className="bg-gray-50 p-4 rounded-md text-center text-gray-600">
               No task changes required.
             </div>
          )}
        </div>

        <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
          <button 
            type="button" onClick={onClose}
            className="px-4 py-2 text-text-main bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel Edit
          </button>
          <button 
            onClick={onConfirm}
            disabled={isApplying}
            className="px-4 py-2 text-brand-black font-medium bg-brand-gold rounded-lg hover:bg-brand-gold-hover transition-colors disabled:opacity-50"
          >
            {isApplying ? 'Applying...' : 'Confirm Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
