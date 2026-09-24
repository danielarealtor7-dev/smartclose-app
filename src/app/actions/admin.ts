'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getUsers() {
  const supabase = await createClient()
  
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching users:', error)
    return { error: 'Failed to fetch users' }
  }

  return { users }
}

export async function updateUserRole(userId: string, newRole: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('users')
    .update({ role: newRole })
    .eq('id', userId)

  if (error) {
    console.error('Error updating user role:', error)
    return { error: 'Failed to update user role' }
  }

  revalidatePath('/dashboard/admin')
  return { success: true }
}

export async function getOrgStats() {
  const supabase = await createClient()

  const [
    { count: usersCount },
    { count: activeTransactions },
    { count: totalTransactions },
    { count: totalContacts }
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('transactions').select('*', { count: 'exact', head: true }).in('status', ['ACTIVE', 'PENDING']),
    supabase.from('transactions').select('*', { count: 'exact', head: true }),
    supabase.from('contacts').select('*', { count: 'exact', head: true })
  ])

  return {
    usersCount: usersCount || 0,
    activeTransactions: activeTransactions || 0,
    totalTransactions: totalTransactions || 0,
    totalContacts: totalContacts || 0
  }
}
