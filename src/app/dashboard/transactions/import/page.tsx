import { ImportWizard } from '@/components/transactions/import/ImportWizard'

export const metadata = {
  title: 'Import Transactions - Smart Close',
}

export default function ImportPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-black">Import Transactions</h1>
        <p className="text-sm text-text-muted mt-1">Upload a Transaction Coordinator Excel file to bulk import records and tasks.</p>
      </div>

      <ImportWizard />
    </div>
  )
}
