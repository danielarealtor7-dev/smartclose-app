'use server'

import { createClient } from '@/utils/supabase/server'

export type DashboardItem = {
  id: string
  transactionId: string
  address: string
  client: string
  title: string
  dueDate: string
  type: string
  responsible: string
  waitingOn?: string
  status: 'PENDING' | 'COMPLETED' | 'WAIVED'
  isClosing: boolean
  isFollowUp: boolean
}

export async function getTodayDashboardItems() {
  const supabase = await createClient()

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) return []
  
  const { data: profile } = await supabase.from('users').select('org_id').eq('auth_id', userData.user.id).single()
  if (!profile?.org_id) return []

  const items: DashboardItem[] = []

  // 1. Fetch pending tasks
  const { data: tasks } = await (await supabase).from('tasks')
    .select(`
      id, title, due_date, status, category, waiting_on, 
      assigned_to,
      transactions!inner(id, org_id, is_archived, property_address, buyer_names, seller_names)
    `)
    .eq('transactions.org_id', profile.org_id)
    .eq('transactions.is_archived', false)
    .eq('status', 'TODO') // 'TODO' is the pending state in tasks table schema

  if (tasks) {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    tasks.forEach((t: any) => {
      if (t.due_date) {
        items.push({
          id: `task-${t.id}`,
          transactionId: t.transactions.id,
          address: t.transactions.property_address || 'TBD',
          client: t.transactions.buyer_names || t.transactions.seller_names || 'Client',
          title: t.title,
          dueDate: t.due_date,
          type: t.category || 'TASK',
          responsible: t.assigned_to ? 'Assigned' : 'Unassigned',
          waitingOn: t.waiting_on,
          status: 'PENDING',
          isClosing: false,
          isFollowUp: t.title.toLowerCase().includes('follow') || t.title.toLowerCase().includes('follow-up')
        })
      }
    })
  }

  // 2. Fetch pending transaction_dates (EMD, Inspection, etc.)
  const { data: dates } = await (await supabase).from('transaction_dates')
    .select(`
      id, name, type, due_date, status,
      responsible_id,
      transactions!inner(id, org_id, is_archived, property_address, buyer_names, seller_names)
    `)
    .eq('transactions.org_id', profile.org_id)
    .eq('transactions.is_archived', false)
    .eq('status', 'PENDING')
    
  if (dates) {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    dates.forEach((d: any) => {
      if (d.due_date) {
        items.push({
          id: `date-${d.id}`,
          transactionId: d.transactions.id,
          address: d.transactions.property_address || 'TBD',
          client: d.transactions.buyer_names || d.transactions.seller_names || 'Client',
          title: d.name,
          dueDate: d.due_date,
          type: d.type || 'DATE',
          responsible: d.responsible_id ? 'Contact' : 'Unassigned',
          status: 'PENDING',
          isClosing: false,
          isFollowUp: false
        })
      }
    })
  }
  
  // 3. Fetch closing dates directly from active transactions
  const { data: closingTxs } = await (await supabase).from('transactions')
    .select(`id, property_address, closing_date, status, buyer_names, seller_names`)
    .eq('org_id', profile.org_id)
    .eq('is_archived', false)
    .not('closing_date', 'is', null)

  if (closingTxs) {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    closingTxs.forEach((tx: any) => {
      if (tx.closing_date && tx.status !== 'CLOSED' && tx.status !== 'CANCELLED') {
        items.push({
          id: `closing-${tx.id}`,
          transactionId: tx.id,
          address: tx.property_address || 'TBD',
          client: tx.buyer_names || tx.seller_names || 'Client',
          title: 'Closing',
          dueDate: tx.closing_date,
          type: 'CLOSING',
          responsible: 'Title Co',
          status: 'PENDING',
          isClosing: true,
          isFollowUp: false
        })
      }
    })
  }

  return items
}
