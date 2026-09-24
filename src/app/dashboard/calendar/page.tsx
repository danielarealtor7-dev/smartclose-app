'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday, 
  parseISO 
} from 'date-fns'
import { ChevronLeft, ChevronRight, Filter, Key, Home } from 'lucide-react'

// Reuse similar mock data structure
const MOCK_EVENTS = [
  { id: '1', date: '2026-09-11', title: 'Earnest Money Deposit', txId: 'tx-1', type: 'EMD', isClosing: false },
  { id: '2', date: '2026-09-11', title: 'Inspection', txId: 'tx-2', type: 'INSPECTION', isClosing: false },
  { id: '3', date: '2026-09-15', title: 'Closing - 123 Pine St', txId: 'tx-1', type: 'CLOSING', isClosing: true },
  { id: '4', date: '2026-09-20', title: 'HOA Approval', txId: 'tx-3', type: 'HOA', isClosing: false },
  { id: '5', date: '2026-09-30', title: 'Closing - 456 Oak', txId: 'tx-2', type: 'CLOSING', isClosing: true },
]

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date('2026-09-01T12:00:00Z')) // Fixed anchor for mock
  const [view, setView] = useState<'month' | 'list'>('month')

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  
  // To keep simple grid math, we pad the start to Sunday and end to Saturday.
  const startDate = new Date(monthStart)
  startDate.setDate(startDate.getDate() - startDate.getDay())
  
  const endDate = new Date(monthEnd)
  if (endDate.getDay() !== 6) {
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()))
  }

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate })

  const handlePrev = () => setCurrentDate(subMonths(currentDate, 1))
  const handleNext = () => setCurrentDate(addMonths(currentDate, 1))
  const handleToday = () => setCurrentDate(new Date())

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-brand-black">Calendar</h1>
        
        <div className="flex items-center gap-3">
          <div className="bg-gray-100 p-1 rounded-lg flex items-center">
            <button 
              onClick={() => setView('month')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md ${view === 'month' ? 'bg-white shadow-sm text-brand-black' : 'text-gray-500'}`}
            >
              Month
            </button>
            <button 
              onClick={() => setView('list')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md ${view === 'list' ? 'bg-white shadow-sm text-brand-black' : 'text-gray-500'}`}
            >
              List
            </button>
          </div>
          
          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col">
        {/* Calendar Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-brand-black">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={handleToday} className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50 font-medium text-brand-black">
              Today
            </button>
            <div className="flex items-center border rounded-md overflow-hidden">
              <button onClick={handlePrev} className="p-2 hover:bg-gray-50"><ChevronLeft className="w-5 h-5" /></button>
              <div className="w-px h-5 bg-gray-200"></div>
              <button onClick={handleNext} className="p-2 hover:bg-gray-50"><ChevronRight className="w-5 h-5" /></button>
            </div>
          </div>
        </div>

        {view === 'month' ? (
          <div className="flex-1 flex flex-col">
            {/* Weekdays */}
            <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="py-2 text-center text-xs font-semibold text-text-muted">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Days Grid */}
            <div className="grid grid-cols-7 flex-1 auto-rows-fr">
              {calendarDays.map((day, idx) => {
                const dayStr = format(day, 'yyyy-MM-dd')
                const dayEvents = MOCK_EVENTS.filter(e => e.date === dayStr)
                const isCurrentMonth = isSameMonth(day, currentDate)
                const isTodayDate = isToday(day)

                return (
                  <div 
                    key={dayStr} 
                    className={`min-h-[120px] p-2 border-b border-r border-gray-100 ${!isCurrentMonth ? 'bg-gray-50/50' : 'bg-white'} ${idx % 7 === 6 ? 'border-r-0' : ''}`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${
                        isTodayDate ? 'bg-brand-gold text-brand-black' : 
                        !isCurrentMonth ? 'text-gray-400' : 'text-brand-black'
                      }`}>
                        {format(day, 'd')}
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      {dayEvents.map(event => (
                        <Link 
                          key={event.id}
                          href={`/dashboard/transactions/${event.txId}`}
                          className={`block px-2 py-1 text-xs rounded shadow-sm border truncate transition-colors ${
                            event.isClosing 
                              ? 'bg-brand-gold text-brand-black border-yellow-500 font-bold hover:bg-brand-gold-hover' 
                              : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {event.isClosing ? (
                            <span className="flex items-center gap-1">
                              <Key className="w-3 h-3 shrink-0" /> CLOSING: {event.title}
                            </span>
                          ) : (
                            event.title
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="text-center text-text-muted py-12">
              <Home className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-lg">List view is selected.</p>
              <p>For a full agenda experience, we display events chronologically here.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
