'use server'

import { createClient } from '@/utils/supabase/server'

export interface CalendarEvent {
  id: string
  date: string
  title: string
  txId: string
  type: string
  isClosing: boolean
}

export async function getCalendarEvents() {
  const supabase = await createClient()

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) return []
  
  const { data: profile } = await supabase.from('users').select('org_id').eq('auth_id', userData.user.id).single()
  if (!profile?.org_id) return []

  const events: CalendarEvent[] = []

  // 1. Fetch Closing Dates
  const { data: transactions, error: txError } = await supabase
    .from('transactions')
    .select('id, property_address, closing_date, status')
    .eq('org_id', profile.org_id)
    .eq('is_archived', false)

  if (!txError && transactions) {
    transactions.forEach(tx => {
      if (tx.closing_date) {
        events.push({
          id: `closing-${tx.id}`,
          date: tx.closing_date,
          title: `Closing - ${tx.property_address || 'TBD'}`,
          txId: tx.id,
          type: 'CLOSING',
          isClosing: true
        })
      }
    })
  }

  // 2. Fetch Other Transaction Dates
  const { data: dates, error: datesError } = await supabase
    .from('transaction_dates')
    .select(`
      id,
      name,
      type,
      due_date,
      transactions!inner(id, org_id, is_archived, property_address)
    `)
    .eq('transactions.org_id', profile.org_id)
    .eq('transactions.is_archived', false)
    .neq('status', 'WAIVED')

  if (!datesError && dates) {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    dates.forEach((d: any) => {
      if (d.due_date) {
        events.push({
          id: `date-${d.id}`,
          date: d.due_date,
          title: `${d.name} - ${d.transactions?.property_address || 'TBD'}`,
          txId: d.transactions.id,
          type: d.type || 'DATE',
          isClosing: false
        })
      }
    })
  }

  return events
}
