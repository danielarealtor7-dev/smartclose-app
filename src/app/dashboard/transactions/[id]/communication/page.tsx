import { createClient } from '@/utils/supabase/server'
import { CommunicationTab } from '@/components/communications/CommunicationTab'
import { getEmailTemplates } from '@/app/actions/communications'

export default async function CommunicationPage({
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
      buyer_agent:contacts!buyer_agent_id(first_name, last_name, email),
      listing_agent:contacts!listing_agent_id(first_name, last_name, email),
      escrow_agent:contacts!escrow_agent_id(first_name, last_name, email),
      lender:contacts!lender_id(first_name, last_name, email),
      title_company:contacts!title_company_id(first_name, last_name, email),
      assigned_tc:users!assigned_tc_id(name, email)
    `)
    .eq('id', resolvedParams.id)
    .single()

  const { data: logs } = await supabase
    .from('communication_logs')
    .select('*')
    .eq('transaction_id', resolvedParams.id)
    .order('created_at', { ascending: false })

  const { templates } = await getEmailTemplates()

  // Mock transaction if not found to avoid crashing the view while DB is not fully seeded
  const tx = transaction || {
    id: resolvedParams.id,
    property_address: '123 Mock Street',
    buyer_names: 'John Doe',
  }

  return (
    <CommunicationTab 
      transaction={tx} 
      templates={templates || []} 
      logs={logs || []} 
    />
  )
}
