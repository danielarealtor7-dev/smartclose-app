import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { EmptyState } from '@/components/ui/EmptyState'
import { Search, FolderClosed, ArchiveRestore } from 'lucide-react'
import { TransactionRowActions } from '@/components/transactions/TransactionRowActions'

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const resolvedParams = await searchParams
  const supabase = await createClient()
  const search = resolvedParams.search || ''

  // Get current user and org_id for tenant isolation
  const { data: { user } } = await supabase.auth.getUser()
  let query = supabase.from('transactions').select('*').eq('is_archived', true)

  if (user) {
    const { data: userData } = await supabase.from('users').select('org_id').eq('id', user.id).single()
    if (userData?.org_id) {
      query = query.eq('org_id', userData.org_id)
    }
  }

  // Text search
  if (search) {
    query = query.or(`property_address.ilike.%${search}%,buyer_names.ilike.%${search}%,seller_names.ilike.%${search}%`)
  }

  // Order by most recently updated or created
  query = query.order('created_at', { ascending: false })

  const { data: archivedTransactions } = await query
  const displayData = archivedTransactions || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-brand-black tracking-tight">Archive</h1>
            <span className="bg-gray-100 text-gray-700 text-xs px-2.5 py-0.5 rounded-full font-medium">
              {displayData.length} {displayData.length === 1 ? 'transaction' : 'transactions'}
            </span>
          </div>
          <p className="mt-1 text-sm text-text-muted">
            Access your archived, closed, or inactive transactions. You can restore them anytime.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between bg-white p-4 rounded-md shadow-sm border border-gray-100">
        <form method="GET" action="/dashboard/archive" className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            name="search"
            defaultValue={search}
            placeholder="Search archived transactions..." 
            className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-brand-gold focus:border-brand-gold w-full min-h-[44px]"
          />
        </form>
      </div>

      {/* Archive List */}
      {displayData.length === 0 ? (
        <EmptyState 
          title="Archive is empty"
          description={
            search 
              ? `No archived transactions found matching "${search}".` 
              : "When a transaction is archived, it will be moved here for your records. You can restore it whenever needed."
          }
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
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800 flex items-center gap-1 w-fit">
                        <ArchiveRestore className="w-3 h-3 text-gray-500" />
                        Archived ({tx.status})
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <TransactionRowActions 
                        id={String(tx.id)} 
                        address={tx.property_address || 'Property'} 
                        isArchived={true} 
                      />
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
