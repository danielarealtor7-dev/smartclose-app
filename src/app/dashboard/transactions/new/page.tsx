import { TransactionForm } from '@/components/transactions/TransactionForm'

export default function NewTransactionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-black tracking-tight">New Transaction</h1>
        <p className="mt-1 text-sm text-text-muted">Create a new real estate transaction to coordinate.</p>
      </div>

      <TransactionForm />
    </div>
  )
}
