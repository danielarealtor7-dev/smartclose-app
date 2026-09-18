'use client'

import { useState } from 'react'
import { EmailComposer } from '@/components/communications/EmailComposer'
import { Transaction, EmailTemplate, CommunicationLog } from '@/types'
import { Mail, Phone, MessageSquare, FileText, Calendar, Plus } from 'lucide-react'

// Normally this would be a Server Component fetching the data,
// but for the UI implementation, I'm wrapping it in a client component layout for interactivity (tabs).
// We will separate data fetching and rendering.

interface CommunicationPageProps {
  transaction: Transaction
  templates: EmailTemplate[]
  logs: CommunicationLog[]
}

export function CommunicationTab({ transaction, templates, logs }: CommunicationPageProps) {
  const [activeTab, setActiveTab] = useState<'log' | 'compose'>('log')

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'Email Draft':
      case 'Email Sent':
      case 'Email Received':
        return <Mail className="w-4 h-4" />
      case 'Call':
        return <Phone className="w-4 h-4" />
      case 'SMS':
        return <MessageSquare className="w-4 h-4" />
      case 'Note':
        return <FileText className="w-4 h-4" />
      default:
        return <Calendar className="w-4 h-4" />
    }
  }

  const getLogColor = (type: string) => {
    switch (type) {
      case 'Email Draft': return 'bg-gray-100 text-gray-600 border-gray-200'
      case 'Email Sent': return 'bg-blue-50 text-blue-600 border-blue-200'
      case 'Email Received': return 'bg-purple-50 text-purple-600 border-purple-200'
      case 'Call': return 'bg-green-50 text-green-600 border-green-200'
      case 'SMS': return 'bg-teal-50 text-teal-600 border-teal-200'
      case 'Note': return 'bg-yellow-50 text-yellow-600 border-yellow-200'
      default: return 'bg-gray-50 text-gray-600 border-gray-200'
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header and Toggle */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-brand-black">Communication</h2>
          <p className="text-sm text-text-muted mt-1">Manage emails, calls, and logs for this transaction.</p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
          <button 
            onClick={() => setActiveTab('log')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'log' ? 'bg-white shadow-sm text-brand-black' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            History Log
          </button>
          <button 
            onClick={() => setActiveTab('compose')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'compose' ? 'bg-white shadow-sm text-brand-black' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Compose Email
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content Area */}
        <div className="lg:col-span-2">
          {activeTab === 'compose' ? (
            <EmailComposer 
              transaction={transaction} 
              templates={templates} 
              onSuccess={() => setActiveTab('log')}
            />
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <h3 className="font-semibold text-brand-black">Activity History</h3>
                <button className="flex items-center gap-1 text-sm text-brand-gold font-medium hover:underline">
                  <Plus className="w-4 h-4" /> Log Activity
                </button>
              </div>
              
              <div className="p-0">
                {logs.length === 0 ? (
                  <div className="p-8 text-center text-text-muted">
                    No communication logged yet. Compose an email or log an activity.
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {logs.map(log => (
                      <li key={log.id} className="p-5 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className={`mt-1 p-2 rounded-full border ${getLogColor(log.type)}`}>
                            {getLogIcon(log.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="font-semibold text-brand-black text-sm">
                                {log.type} {log.subject ? `- ${log.subject}` : ''}
                              </h4>
                              <span className="text-xs text-gray-500">
                                {new Date(log.created_at).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 whitespace-pre-wrap">{log.summary}</p>
                            
                            {(log.follow_up_date || log.waiting_on) && (
                              <div className="mt-3 flex gap-3 flex-wrap">
                                {log.follow_up_date && (
                                  <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-red-50 text-red-700 border border-red-100 rounded">
                                    <Calendar className="w-3 h-3" /> Follow-up: {new Date(log.follow_up_date).toLocaleDateString()}
                                  </span>
                                )}
                                {log.waiting_on && (
                                  <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-yellow-50 text-yellow-700 border border-yellow-100 rounded">
                                    Waiting on: {log.waiting_on}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-semibold text-brand-black mb-3">Quick Reference</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-500 block text-xs">Buyer</span>
                <span className="font-medium">{transaction.buyer_names || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs">Seller</span>
                <span className="font-medium">{transaction.seller_names || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs">Property</span>
                <span className="font-medium">{transaction.property_address}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
