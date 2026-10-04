import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Calendar, CheckCircle2, ChevronLeft, MapPin, User } from 'lucide-react'
import { TransactionTabs } from '@/components/transactions/TransactionTabs'
import { TransactionDetailActions } from '@/components/transactions/TransactionDetailActions'

export default async function TransactionDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const supabase = await createClient()

  // Fetch transaction data for header
  const { data: transaction } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', resolvedParams.id)
    .single()

  if (!transaction) {
    const { notFound } = await import('next/navigation')
    notFound()
  }

  const tx = transaction


  const tabs = [
    { name: 'Overview', href: `/dashboard/transactions/${tx.id}` },
    { name: 'Dates', href: `/dashboard/transactions/${tx.id}/dates` },
    { name: 'Tasks', href: `/dashboard/transactions/${tx.id}/tasks` },
    { name: 'Documents', href: `/dashboard/transactions/${tx.id}/documents` },
    { name: 'Contacts', href: `/dashboard/transactions/${tx.id}/contacts` },
    { name: 'Communication', href: `/dashboard/transactions/${tx.id}/communication` },
  ]

  return (
    <div className="flex flex-col h-full bg-bg-soft -mx-4 sm:-mx-6 md:-mx-8 -my-6">
      {/* Fixed Header Area */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 md:px-8 pt-4 pb-0 sticky top-0 z-10 shadow-sm">
        <div className="mb-4">
          <Link href="/dashboard/transactions" className="inline-flex items-center text-sm font-medium text-text-muted hover:text-brand-black transition-colors">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Transactions
          </Link>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-brand-black flex items-center gap-2">
              <MapPin className="h-6 w-6 text-brand-gold" />
              {tx.property_address}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-text-muted">
              <span className="flex items-center gap-1"><User className="h-4 w-4" /> Client: {tx.buyer_names || tx.seller_names || 'N/A'}</span>
              <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Effective: {tx.effective_date || 'TBD'}</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> Closing: {tx.closing_date || 'TBD'}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              tx.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
              tx.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
              tx.status === 'CLOSED' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {tx.status}
            </span>
            <TransactionDetailActions id={String(tx.id)} address={tx.property_address || 'Property'} isArchived={Boolean(tx.is_archived)} />
          </div>
        </div>

        {/* Navigation Tabs */}
        <TransactionTabs tabs={tabs} />
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 p-4 sm:px-6 md:px-8 py-6">
        {children}
      </div>
    </div>
  )
}
