import { createClient } from '@/utils/supabase/server'
import { getAllContacts } from '@/app/actions/contacts'
import { TransactionContactsClient } from '@/components/transactions/TransactionContactsClient'
import { notFound } from 'next/navigation'

export default async function TransactionContactsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const supabase = await createClient()

  const { data: transaction } = await supabase
    .from('transactions')
    .select(`
      *,
      buyer_agent:contacts!transactions_buyer_agent_id_fkey(*),
      listing_agent:contacts!transactions_listing_agent_id_fkey(*),
      lender:contacts!transactions_lender_id_fkey(*),
      inspector:contacts!transactions_inspector_id_fkey(*),
      title_company:contacts!transactions_title_company_id_fkey(*),
      escrow_agent:contacts!transactions_escrow_agent_id_fkey(*)
    `)
    .eq('id', resolvedParams.id)
    .single()

  if (!transaction) {
    notFound()
  }

  const { data: contacts } = await getAllContacts()

  return (
    <TransactionContactsClient 
      transaction={transaction}
      allContacts={contacts || []}
    />
  )
}
