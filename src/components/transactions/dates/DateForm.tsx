'use client'

import React, { useState } from 'react'
import { addCalendarDays, addBusinessDays } from '@/utils/dates'

interface DateFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: Record<string, unknown>) => void
  referenceDate?: string // e.g. Effective Date, to calculate offsets
}

export function DateForm({ isOpen, onClose, onSave, referenceDate }: DateFormProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState('CUSTOM')
  const [mode, setMode] = useState<'MANUAL' | 'CALCULATE'>('MANUAL')
  
  // Manual state
  const [manualDate, setManualDate] = useState('')
  const [dueTime, setDueTime] = useState('')
  
  // Calc state
  const [daysOffset, setDaysOffset] = useState<number>(0)
  const [dayType, setDayType] = useState<'CALENDAR' | 'BUSINESS'>('CALENDAR')

  if (!isOpen) return null

  let calculatedDate = ''
  if (mode === 'CALCULATE' && referenceDate) {
    if (dayType === 'CALENDAR') {
      calculatedDate = addCalendarDays(referenceDate, daysOffset)
    } else {
      calculatedDate = addBusinessDays(referenceDate, daysOffset)
    }
  }

  const finalDate = mode === 'MANUAL' ? manualDate : calculatedDate

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!finalDate || !name) return
    onSave({
      name,
      type,
      due_date: finalDate,
      due_time: dueTime || null
    })
    setName('')
    setManualDate('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-brand-black">Add Important Date</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Name</label>
              <input 
                required value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g. HOA Approval"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-gold focus:border-brand-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Type</label>
              <select 
                value={type} onChange={e => setType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-gold focus:border-brand-gold"
              >
                <option value="EFFECTIVE_DATE">Effective Date</option>
                <option value="EMD">Earnest Money Deposit</option>
                <option value="INSPECTION">Inspection Deadline</option>
                <option value="CLOSING">Closing Date</option>
                <option value="CUSTOM">Custom</option>
              </select>
            </div>
          </div>

          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setMode('MANUAL')}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md ${mode === 'MANUAL' ? 'bg-white shadow-sm text-brand-black' : 'text-gray-500 hover:text-brand-black'}`}
            >
              Manual Entry
            </button>
            <button
              type="button"
              onClick={() => setMode('CALCULATE')}
              disabled={!referenceDate}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md ${mode === 'CALCULATE' ? 'bg-white shadow-sm text-brand-black' : 'text-gray-500 hover:text-brand-black disabled:opacity-50'}`}
              title={!referenceDate ? 'No Effective Date set to calculate from' : ''}
            >
              Calculate
            </button>
          </div>

          {mode === 'MANUAL' ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-main mb-1">Date</label>
                <input 
                  type="date" required value={manualDate} onChange={e => setManualDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-gold focus:border-brand-gold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-main mb-1">Time (Optional)</label>
                <input 
                  type="time" value={dueTime} onChange={e => setDueTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-gold focus:border-brand-gold"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-main mb-1">Days</label>
                  <input 
                    type="number" value={daysOffset} onChange={e => setDaysOffset(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-gold focus:border-brand-gold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-main mb-1">Type</label>
                  <select 
                    value={dayType} onChange={e => setDayType(e.target.value as 'CALENDAR' | 'BUSINESS')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-gold focus:border-brand-gold"
                  >
                    <option value="CALENDAR">Calendar Days</option>
                    <option value="BUSINESS">Business Days</option>
                  </select>
                </div>
              </div>
              <div className="text-sm text-brand-black bg-brand-gold bg-opacity-20 p-3 rounded text-center">
                Calculated Date: <strong>{calculatedDate || 'N/A'}</strong>
              </div>
            </div>
          )}

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-text-main hover:bg-gray-100 rounded-md"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 text-sm font-medium bg-brand-black text-white hover:bg-gray-800 rounded-md"
            >
              Save Date
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
