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

  if (!transaction) {
    const { notFound } = await import('next/navigation')
    notFound()
  }

  const tx = transaction


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
