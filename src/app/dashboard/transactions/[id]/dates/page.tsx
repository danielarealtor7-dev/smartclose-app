'use client'

import { useState } from 'react'
import { Plus, Check, X, Clock } from 'lucide-react'
import { isOverdue } from '@/utils/dates'
import type { TransactionDate } from '@/types'
import { ExtendModal } from '@/components/transactions/dates/ExtendModal'
import { DateForm } from '@/components/transactions/dates/DateForm'

// Mock Data since DB is not available
const MOCK_DATES: TransactionDate[] = [
  {
    id: 'd1',
    transaction_id: 'mock-1',
    name: 'Effective Date',
    type: 'EFFECTIVE_DATE',
    due_date: '2026-09-01',
    original_date: '2026-09-01',
    status: 'COMPLETED',
  },
  {
    id: 'd2',
    transaction_id: 'mock-1',
    name: 'Earnest Money Deposit',
    type: 'EMD',
    due_date: '2026-09-04',
    original_date: '2026-09-04',
    status: 'COMPLETED',
  },
  {
    id: 'd3',
    transaction_id: 'mock-1',
    name: 'Inspection Deadline',
    type: 'INSPECTION',
    due_date: '2026-09-10', // Past date, should be overdue
    original_date: '2026-09-10',
    status: 'PENDING',
  },
  {
    id: 'd4',
    transaction_id: 'mock-1',
    name: 'Closing Date',
    type: 'CLOSING',
    due_date: '2026-09-30', // Future
    original_date: '2026-09-30',
    status: 'PENDING',
  },
]

export default function TransactionDatesPage() {
  const [dates, setDates] = useState<TransactionDate[]>(MOCK_DATES)
  const [isAddFormOpen, setIsAddFormOpen] = useState(false)
  
  const [extendModalState, setExtendModalState] = useState<{ isOpen: boolean, dateId: string, currentDate: string }>({
    isOpen: false,
    dateId: '',
    currentDate: ''
  })

  // Find Effective Date for the form calculator
  const effectiveDate = dates.find(d => d.type === 'EFFECTIVE_DATE')?.due_date

  // Handlers for mock state changes
  const handleAdd = (data: Record<string, unknown>) => {
    const newId = `d${Date.now()}`
    setDates(prev => [...prev, {
      ...(data as Partial<TransactionDate>),
      id: newId,
      transaction_id: 'mock-1',
      original_date: data.due_date as string,
      status: 'PENDING'
    } as TransactionDate])
  }

  const handleComplete = (id: string) => {
    setDates(prev => prev.map(d => d.id === id ? { ...d, status: 'COMPLETED' } : d))
  }
  
  const handleWaive = (id: string) => {
    setDates(prev => prev.map(d => d.id === id ? { ...d, status: 'WAIVED' } : d))
  }

  const openExtendModal = (id: string, currentDate: string) => {
    setExtendModalState({ isOpen: true, dateId: id, currentDate })
  }

  const handleExtend = (id: string, newDate: string, reason: string) => {
    console.log('Extending with reason:', reason)
    setDates(prev => prev.map(d => d.id === id ? { ...d, status: 'EXTENDED', due_date: newDate } : d))
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-brand-black">Important Dates</h2>
        <button 
          onClick={() => setIsAddFormOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-brand-gold text-brand-black font-medium rounded-lg hover:bg-brand-gold-hover transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Date</span>
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <ul className="divide-y divide-gray-200">
          {dates.sort((a, b) => a.due_date.localeCompare(b.due_date)).map(date => {
            const overdue = date.status === 'PENDING' && isOverdue(date.due_date)
            return (
              <li key={date.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  
                  <div>
                    <h3 className="text-lg font-medium text-brand-black">{date.name}</h3>
                    <p className="text-sm text-brand-muted mt-1">
                      Due: <strong className={overdue ? 'text-brand-danger' : 'text-brand-black'}>{date.due_date}</strong>
                      {date.due_time && ` at ${date.due_time}`}
                    </p>
                    {date.status === 'EXTENDED' && (
                      <p className="text-xs text-brand-muted mt-1">
                        Originally: {date.original_date}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                      date.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      date.status === 'WAIVED' ? 'bg-gray-100 text-gray-800' :
                      overdue ? 'bg-red-100 text-brand-danger' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {overdue ? 'OVERDUE' : date.status}
                    </span>

                    {date.status === 'PENDING' || overdue || date.status === 'EXTENDED' ? (
                      <div className="flex items-center gap-2 border-l pl-3 ml-1 border-gray-200">
                        <button 
                          onClick={() => handleComplete(date.id!)}
                          title="Complete" 
                          className="p-1.5 text-gray-400 hover:text-green-600 rounded-md hover:bg-green-50 transition-colors"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleWaive(date.id!)}
                          title="Waive" 
                          className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => openExtendModal(date.id!, date.due_date)}
                          title="Extend" 
                          className="p-1.5 text-gray-400 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                        >
                          <Clock className="w-5 h-5" />
                        </button>
                      </div>
                    ) : null}
                  </div>
                  
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      <ExtendModal 
        isOpen={extendModalState.isOpen}
        dateId={extendModalState.dateId}
        currentDate={extendModalState.currentDate}
        onClose={() => setExtendModalState(s => ({...s, isOpen: false}))}
        onExtend={handleExtend}
      />

      <DateForm 
        isOpen={isAddFormOpen}
        onClose={() => setIsAddFormOpen(false)}
        onSave={handleAdd}
        referenceDate={effectiveDate}
      />
    </div>
  )
}


