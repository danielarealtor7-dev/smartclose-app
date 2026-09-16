'use client'
import React, { useState } from 'react'

interface ExtendModalProps {
  dateId: string
  currentDate: string
  isOpen: boolean
  onClose: () => void
  onExtend: (dateId: string, newDate: string, reason: string) => void
}

export function ExtendModal({ dateId, currentDate, isOpen, onClose, onExtend }: ExtendModalProps) {
  const [newDate, setNewDate] = useState('')
  const [reason, setReason] = useState('')
  const [file, setFile] = useState<File | null>(null)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDate || !reason) return
    onExtend(dateId, newDate, reason)
    setNewDate('')
    setReason('')
    setFile(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-brand-black">Extend Deadline</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Current Date</label>
            <p className="text-brand-black font-medium">{currentDate}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">New Date</label>
            <input 
              type="date" 
              required
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full min-h-[44px] px-3 border border-gray-300 rounded-md focus:ring-brand-gold focus:border-brand-gold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Reason for Extension</label>
            <textarea 
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="e.g. Waiting on lender approval..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-gold focus:border-brand-gold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Upload Addendum (Optional)</label>
            <input 
              type="file" 
              accept=".pdf,.doc,.docx"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-gold file:text-brand-black hover:file:bg-brand-gold-hover"
            />
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-text-main hover:bg-gray-100 rounded-md min-h-[44px]"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 text-sm font-medium bg-brand-gold text-brand-black hover:bg-brand-gold-hover rounded-md min-h-[44px]"
            >
              Confirm Extension
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
