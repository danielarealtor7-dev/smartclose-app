'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle2, Clock, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react'
import { categorizeUrgency, type UrgencyCategory } from '@/utils/dates'

import { getTodayDashboardItems, type DashboardItem } from '@/app/actions/dashboard'

const CATEGORY_TITLES: Record<UrgencyCategory, string> = {
  OVERDUE: 'Overdue',
  DUE_TODAY: 'Due Today',
  NEXT_3_DAYS: 'Next 3 Days',
  NEXT_7_DAYS: 'Next 7 Days',
  FUTURE: 'Upcoming'
}

export default function TodayDashboard() {
  const [items, setItems] = useState<DashboardItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      const data = await getTodayDashboardItems()
      setItems(data)
      setIsLoading(false)
    }
    loadData()
  }, [])

  // We only care about pending items for the active dashboard
  const pendingItems = items.filter(i => i.status === 'PENDING')

  // Grouping logic (Deduping happens naturally since we place the object in one bucket)
  const grouped = {
    OVERDUE: [] as DashboardItem[],
    DUE_TODAY: [] as DashboardItem[],
    NEXT_3_DAYS: [] as DashboardItem[],
    NEXT_7_DAYS: [] as DashboardItem[],
    FUTURE: [] as DashboardItem[]
  }

  // We will collect special tags to render inside the row
  pendingItems.forEach(item => {
    const urgency = categorizeUrgency(item.dueDate)
    grouped[urgency].push(item)
  })

  // Sort each group by date
  Object.values(grouped).forEach(group => {
    group.sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  })

  const renderItem = (item: DashboardItem) => {
    const isOverdue = categorizeUrgency(item.dueDate) === 'OVERDUE'
    
    return (
      <li key={item.id} className="p-4 sm:p-5 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <Link href={`/dashboard/transactions/${item.transactionId}`} className="text-sm font-semibold text-brand-black hover:text-brand-gold transition-colors">
                {item.address}
              </Link>
              <span className="text-xs text-text-muted px-2 py-0.5 bg-gray-100 rounded-full">
                {item.client}
              </span>
              {item.isClosing && (
                <span className="text-xs font-bold text-white bg-brand-gold px-2 py-0.5 rounded-full">
                  CLOSING
                </span>
              )}
              {item.waitingOn && (
                <span className="text-xs font-medium text-yellow-800 bg-yellow-100 px-2 py-0.5 rounded-full flex items-center">
                  <Clock className="w-3 h-3 mr-1" /> Waiting on: {item.waitingOn}
                </span>
              )}
              {item.isFollowUp && (
                <span className="text-xs font-medium text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
                  Follow-up
                </span>
              )}
            </div>
            
            <h4 className="text-base font-medium text-brand-black">{item.title}</h4>
            
            <div className="mt-2 flex items-center gap-4 text-sm">
              <span className={`font-medium ${isOverdue ? 'text-brand-danger' : 'text-text-main'}`}>
                {item.dueDate}
              </span>
              <span className="text-text-muted flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                Resp: {item.responsible}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button 
              className="p-2 text-gray-400 hover:text-green-600 rounded-md hover:bg-green-50 transition-colors"
              title="Mark Completed"
              onClick={() => {
                setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'COMPLETED' } : i))
              }}
            >
              <CheckCircle2 className="w-5 h-5" />
            </button>
            <Link 
              href={`/dashboard/transactions/${item.transactionId}`}
              className="p-2 text-gray-400 hover:text-brand-gold rounded-md hover:bg-yellow-50 transition-colors"
              title="Go to Transaction"
            >
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </li>
    )
  }

  const sections: UrgencyCategory[] = ['OVERDUE', 'DUE_TODAY', 'NEXT_3_DAYS', 'NEXT_7_DAYS']

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-black">Today</h1>
          <p className="text-text-muted mt-1">Here is your priority list for {new Date().toLocaleDateString('en-US', { timeZone: 'America/New_York', weekday: 'long', month: 'long', day: 'numeric' })}.</p>
        </div>
        {isLoading && <Loader2 className="w-6 h-6 text-brand-gold animate-spin" />}
      </div>

      <div className="space-y-6">
        {sections.map(category => {
          const items = grouped[category]
          if (items.length === 0) return null

          // Semantic header colors based on category
          const isOverdue = category === 'OVERDUE'
          const isToday = category === 'DUE_TODAY'
          
          return (
            <div key={category} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className={`px-5 py-3 border-b flex items-center gap-2
                ${isOverdue ? 'bg-red-50 border-red-100 text-brand-danger' : 
                  isToday ? 'bg-yellow-50 border-yellow-100 text-yellow-800' : 
                  'bg-gray-50 border-gray-200 text-brand-black'}
              `}>
                {isOverdue && <AlertTriangle className="w-5 h-5" />}
                {isToday && <Clock className="w-5 h-5" />}
                <h3 className="font-semibold text-lg">{CATEGORY_TITLES[category]} <span className="opacity-75 text-sm ml-2">({items.length})</span></h3>
              </div>
              <ul className="divide-y divide-gray-100">
                {items.map(renderItem)}
              </ul>
            </div>
          )
        })}

        {/* If everything is magically 0 */}
        {sections.every(cat => grouped[cat].length === 0) && (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-text-muted">
            <CheckCircle2 className="w-12 h-12 mx-auto text-green-400 mb-3" />
            <p className="text-lg font-medium text-brand-black">All caught up!</p>
            <p>You have no pending items for the next 7 days.</p>
          </div>
        )}
      </div>
    </div>
  )
}
