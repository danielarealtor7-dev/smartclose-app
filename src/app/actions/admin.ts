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
    return { error: `Failed to fetch users: ${error.message || JSON.stringify(error)}` }
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

export async function inviteUser(email: string, role: string) {
  try {
    const supabase = await createClient()
    
    // Get the current user's org
    const { data: userData } = await supabase.auth.getUser()
    if (!userData?.user) return { error: 'Not authenticated' }

    const { data: profile } = await supabase
      .from('users')
      .select('org_id')
      .eq('auth_id', userData.user.id)
      .single()

    if (!profile?.org_id) return { error: 'No organization found' }

    // Dynamic import to avoid errors if the file is imported elsewhere
    const { createAdminClient } = await import('@/utils/supabase/admin')
    const adminClient = createAdminClient()

    // 1. Invite the user via Supabase Auth
    const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
      data: { role: role, org_id: profile.org_id } // Store in raw_user_meta_data
    })

    if (inviteError) {
      console.error('Error sending invite:', inviteError)
      return { error: `Failed to send invite: ${inviteError.message}` }
    }

    // 2. We can optionally pre-create their record in the 'users' table or let a DB trigger do it
    // Usually, a trigger on auth.users handles creation in public.users, but if it doesn't map correctly,
    // we should ensure they are in the public.users table.
    
    // The auth.users trigger usually creates the public.user record. 
    // Wait, let's update their role in public.users explicitly if the trigger already ran, 
    // or insert it if the trigger doesn't exist for invites.
    const { error: upsertError } = await adminClient
      .from('users')
      .upsert({
        auth_id: inviteData.user.id,
        org_id: profile.org_id,
        role: role,
        email: email
      }, { onConflict: 'auth_id' })

    if (upsertError) {
      console.error('Error linking user record:', upsertError)
    }

    revalidatePath('/dashboard/admin')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred.' }
  }
}

export async function generateWhatsAppInvite(email: string, role: string) {
  try {
    const supabase = await createClient()
    
    // Get the current user's org
    const { data: userData } = await supabase.auth.getUser()
    if (!userData?.user) return { error: 'Not authenticated' }

    const { data: profile } = await supabase
      .from('users')
      .select('org_id')
      .eq('auth_id', userData.user.id)
      .single()

    if (!profile?.org_id) return { error: 'No organization found' }

    const { createAdminClient } = await import('@/utils/supabase/admin')
    const adminClient = createAdminClient()

    // 1. Generate the invite link via Supabase Auth
    // This creates the user in auth.users but does NOT send an email
    const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
      type: 'invite',
      email: email,
      options: {
        data: { role: role, org_id: profile.org_id }
      }
    })

    if (linkError) {
      console.error('Error generating link:', linkError)
      return { error: `Failed to generate link: ${linkError.message}` }
    }

    // 2. Insert into our users table
    const { error: upsertError } = await adminClient
      .from('users')
      .upsert({
        auth_id: linkData.user.id,
        org_id: profile.org_id,
        role: role,
        email: email
      }, { onConflict: 'auth_id' })

    if (upsertError) {
      console.error('Error linking user record:', upsertError)
    }

    revalidatePath('/dashboard/admin')
    
    return { 
      success: true, 
      link: linkData.properties?.action_link || '' 
    }
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred.' }
  }
}
