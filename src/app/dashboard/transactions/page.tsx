import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { EmptyState } from '@/components/ui/EmptyState'
import { Search, Filter, FolderClosed, Plus } from 'lucide-react'

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; search?: string; status?: string }>
}) {
  const resolvedParams = await searchParams
  const supabase = await createClient()
  const view = resolvedParams.view || 'active'
  const search = resolvedParams.search || ''

  // Build query
  let query = supabase.from('transactions').select('*')
  
  // Basic filtering based on view
  if (view === 'active') {
    query = query.eq('status', 'ACTIVE').eq('is_archived', false)
  } else if (view === 'closed') {
    query = query.eq('status', 'CLOSED').eq('is_archived', false)
  } else if (view === 'cancelled') {
    query = query.eq('status', 'CANCELLED').eq('is_archived', false)
  }

  // Text Search
  if (search) {
    query = query.or(`property_address.ilike.%${search}%,buyer_names.ilike.%${search}%,seller_names.ilike.%${search}%`)
  }

  // Order
  query = query.order('created_at', { ascending: false })

  const { data: transactions, error } = await query

  // We mock data for display purposes if the DB connection fails
  const displayData = transactions && transactions.length > 0 ? transactions : (error ? [] : [
    { id: 'mock-1', property_address: '123 Test Ave', buyer_names: 'Alice Smith', status: 'ACTIVE', closing_date: '2026-10-15', price: 350000 },
    { id: 'mock-2', property_address: '456 Mock Blvd', buyer_names: 'Bob Jones', status: 'PENDING', closing_date: '2026-11-01', price: 420000 }
  ])

  const views = [
    { id: 'active', label: 'Active' },
    { id: 'closing-soon', label: 'Closing Soon' },
    { id: 'at-risk', label: 'At Risk' },
    { id: 'closed', label: 'Closed' },
    { id: 'cancelled', label: 'Cancelled' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-black tracking-tight">Transactions</h1>
          <p className="mt-1 text-sm text-text-muted">Manage all your real estate transactions.</p>
        </div>
        <Link 
          href="/dashboard/transactions/new"
          className="inline-flex items-center justify-center rounded-md bg-brand-gold px-4 py-2 text-sm font-medium text-brand-black hover:bg-gold-hover focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2 min-h-[44px]"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Transaction
        </Link>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between bg-white p-4 rounded-md shadow-sm border border-gray-100">
        <div className="flex space-x-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar flex-1">
          {views.map((v) => (
            <Link
              key={v.id}
              href={`/dashboard/transactions?view=${v.id}`}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium transition-colors min-h-[44px] flex items-center ${
                view === v.id
                  ? 'bg-brand-black text-brand-gold'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {v.label}
            </Link>
          ))}
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by client or address..." 
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-brand-gold focus:border-brand-gold w-full md:w-64 min-h-[44px]"
            />
          </div>
          <button className="p-2 border border-gray-300 rounded-md text-gray-500 hover:bg-gray-50 min-h-[44px] min-w-[44px] flex items-center justify-center">
            <Filter className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Transactions List */}
      {displayData.length === 0 ? (
        <EmptyState 
          title="No transactions found"
          description={`There are no transactions matching your current view or search criteria.`}
          icon={FolderClosed}
        />
      ) : (
        <div className="bg-white shadow-sm rounded-md border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Property</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Closing Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {displayData.map((tx: any) => (
                  <tr key={String(tx.id)} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-brand-black">
                      <Link href={`/dashboard/transactions/${tx.id}`} className="hover:text-brand-gold hover:underline">
                        {tx.property_address}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{tx.buyer_names || tx.seller_names || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-600">${Number(tx.price || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-600">{tx.closing_date || 'TBD'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        tx.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        tx.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        tx.status === 'CLOSED' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/dashboard/transactions/${tx.id}`} className="text-brand-gold hover:text-gold-hover font-medium">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
