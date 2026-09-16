import { createClient } from '@/utils/supabase/server'
import { TransactionForm } from '@/components/transactions/TransactionForm'

export default async function EditTransactionPage({
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

  // Mock data if running locally without DB connected
  const tx = transaction || {
    id: resolvedParams.id,
    property_address: '123 Mock Street',
    city: 'Miami',
    state: 'FL',
    zip_code: '33101',
    transaction_side: 'BUYER',
    property_type: 'SINGLE_FAMILY',
    financing_type: 'CONVENTIONAL',
    status: 'ACTIVE',
    price: 450000,
    emd_amount: 5000,
    buyer_names: 'John Doe',
    seller_names: 'Jane Smith',
    notes: 'This is a mock transaction.',
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-brand-black tracking-tight">Edit Transaction</h2>
        <p className="mt-1 text-sm text-text-muted">Update details for {tx.property_address}</p>
      </div>

      <TransactionForm initialData={tx} />
    </div>
  )
}
