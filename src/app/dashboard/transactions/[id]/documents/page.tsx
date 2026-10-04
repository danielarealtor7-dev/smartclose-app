import { createClient } from '@/utils/supabase/server'
import { getTransactionDocuments } from '@/app/actions/documents'
import { DocumentsClient } from '@/components/documents/DocumentsClient'
import { notFound } from 'next/navigation'

export default async function TransactionDocumentsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const supabase = await createClient()

  const { data: transaction } = await supabase
    .from('transactions')
    .select('id, property_address')
    .eq('id', resolvedParams.id)
    .single()

  if (!transaction) {
    notFound()
  }

  const { data: documents } = await getTransactionDocuments(resolvedParams.id)

  return (
    <DocumentsClient
      transactionId={transaction.id}
      initialDocuments={documents || []}
      propertyAddress={transaction.property_address}
    />
  )
}
