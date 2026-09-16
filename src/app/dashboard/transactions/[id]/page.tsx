import { createClient } from '@/utils/supabase/server'

export default async function TransactionOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const supabase = await createClient()

  const { data: transaction } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', resolvedParams.id)
    .single()

  const tx = transaction || {
    id: resolvedParams.id,
    property_address: '123 Mock Street',
    city: 'Miami',
    state: 'FL',
    zip_code: '33101',
    transaction_side: 'BUYER',
    property_type: 'SINGLE_FAMILY',
    financing_type: 'CONVENTIONAL',
    price: 450000,
    emd_amount: 5000,
    buyer_names: 'John Doe',
    seller_names: 'Jane Smith',
    notes: 'This is a mock transaction for preview since the DB is not connected locally.',
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <h2 className="text-lg font-bold text-brand-black mb-4">Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Property Info */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Property Details</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Address</dt>
              <dd className="font-medium text-brand-black text-right">{tx.property_address}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">City, State ZIP</dt>
              <dd className="font-medium text-brand-black">{tx.city}, {tx.state} {tx.zip_code}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Property Type</dt>
              <dd className="font-medium text-brand-black">{tx.property_type}</dd>
            </div>
          </dl>
        </div>

        {/* Financials */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Financials</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Purchase Price</dt>
              <dd className="font-medium text-brand-black">${Number(tx.price).toLocaleString()}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">EMD Amount</dt>
              <dd className="font-medium text-brand-black">${Number(tx.emd_amount || 0).toLocaleString()}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Financing Type</dt>
              <dd className="font-medium text-brand-black">{tx.financing_type}</dd>
            </div>
          </dl>
        </div>

        {/* Transaction Info */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Transaction Info</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Side</dt>
              <dd className="font-medium text-brand-black">{tx.transaction_side}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Buyer(s)</dt>
              <dd className="font-medium text-brand-black">{tx.buyer_names || 'N/A'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Seller(s)</dt>
              <dd className="font-medium text-brand-black">{tx.seller_names || 'N/A'}</dd>
            </div>
          </dl>
        </div>

        {/* Notes */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Notes</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{tx.notes || 'No notes provided.'}</p>
        </div>
      </div>
    </div>
  )
}
