'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getUsers() {
  const supabase = await createClient()

  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) {
    return { error: 'Not authenticated' }
  }

  const { data: profile } = await supabase
    .from('users')
    .select('id, auth_id, org_id, role')
    .eq('auth_id', userData.user.id)
    .single()

  if (!profile?.org_id) {
    return { error: 'No organization found for current user' }
  }

  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .eq('org_id', profile.org_id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching users:', error)
    return { error: `Failed to fetch users: ${error.message || JSON.stringify(error)}` }
  }

  return {
    users,
    currentUserId: profile.id,
    currentAuthId: userData.user.id,
    currentUserRole: profile.role
  }
}

export async function updateUserRole(userId: string, newRole: string) {
  try {
    const supabase = await createClient()

    const { data: userData } = await supabase.auth.getUser()
    if (!userData?.user) return { error: 'Not authenticated' }

    const { data: caller } = await supabase
      .from('users')
      .select('id, org_id, role, auth_id')
      .eq('auth_id', userData.user.id)
      .single()

    if (!caller || !['SUPER_ADMIN', 'ADMIN'].includes(caller.role)) {
      return { error: 'Unauthorized: Only administrators can update roles' }
    }

    const validRoles = ['SUPER_ADMIN', 'ADMIN', 'AGENT', 'ASSISTANT']
    if (!validRoles.includes(newRole)) {
      return { error: 'Invalid role specified' }
    }

    // Verify target user belongs to caller's org
    const { data: targetUser } = await supabase
      .from('users')
      .select('id, org_id, role, auth_id')
      .eq('id', userId)
      .single()

    if (!targetUser || targetUser.org_id !== caller.org_id) {
      return { error: 'User not found in your organization' }
    }

    // Prevent demoting oneself
    if (targetUser.auth_id === userData.user.id && newRole !== targetUser.role) {
      return { error: 'You cannot change your own role to avoid locking yourself out' }
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', userId)
      .eq('org_id', caller.org_id)

    if (updateError) {
      console.error('Error updating user role:', updateError)
      return { error: 'Failed to update user role' }
    }

    // Sync auth metadata if possible
    try {
      if (targetUser.auth_id) {
        const { createAdminClient } = await import('@/utils/supabase/admin')
        const adminClient = createAdminClient()
        await adminClient.auth.admin.updateUserById(targetUser.auth_id, {
          user_metadata: { role: newRole, org_id: caller.org_id }
        })
      }
    } catch (metaErr) {
      console.warn('Could not update auth user metadata:', metaErr)
    }

    revalidatePath('/dashboard/admin')
    return { success: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred.'
    return { error: message }
  }
}

export async function deleteUserFromOrg(userId: string) {
  try {
    const supabase = await createClient()

    const { data: userData } = await supabase.auth.getUser()
    if (!userData?.user) return { error: 'Not authenticated' }

    const { data: caller } = await supabase
      .from('users')
      .select('id, org_id, role, auth_id')
      .eq('auth_id', userData.user.id)
      .single()

    if (!caller || !['SUPER_ADMIN', 'ADMIN'].includes(caller.role)) {
      return { error: 'Unauthorized: Only administrators can remove users' }
    }

    // Verify target user belongs to caller's org
    const { data: targetUser } = await supabase
      .from('users')
      .select('id, org_id, role, auth_id, email')
      .eq('id', userId)
      .single()

    if (!targetUser || targetUser.org_id !== caller.org_id) {
      return { error: 'User not found in your organization' }
    }

    // Prevent deleting oneself
    if (targetUser.auth_id === userData.user.id || targetUser.id === caller.id) {
      return { error: 'You cannot remove your own account from the organization' }
    }

    const { createAdminClient } = await import('@/utils/supabase/admin')
    const adminClient = createAdminClient()

    // 1. Delete from public.users with strict org check
    const { error: dbDeleteError } = await adminClient
      .from('users')
      .delete()
      .eq('id', userId)
      .eq('org_id', caller.org_id)

    if (dbDeleteError) {
      console.error('Error deleting user record:', dbDeleteError)
      return { error: `Failed to remove user: ${dbDeleteError.message}` }
    }

    // 2. Delete from auth.users to invalidate credentials
    if (targetUser.auth_id) {
      const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(targetUser.auth_id)
      if (authDeleteError) {
        console.warn('Note: Could not delete user from auth.users (may already be deleted):', authDeleteError.message)
      }
    }

    revalidatePath('/dashboard/admin')
    return { success: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred.'
    return { error: message }
  }
}

export async function getOrgStats() {
  const supabase = await createClient()

  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) {
    return {
      usersCount: 0,
      activeTransactions: 0,
      totalTransactions: 0,
      totalContacts: 0
    }
  }

  const { data: profile } = await supabase
    .from('users')
    .select('org_id')
    .eq('auth_id', userData.user.id)
    .single()

  const orgId = profile?.org_id

  if (!orgId) {
    return {
      usersCount: 0,
      activeTransactions: 0,
      totalTransactions: 0,
      totalContacts: 0
    }
  }

  const [
    { count: usersCount },
    { count: activeTransactions },
    { count: totalTransactions },
    { count: totalContacts }
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('org_id', orgId),
    supabase.from('transactions').select('*', { count: 'exact', head: true }).eq('org_id', orgId).in('status', ['ACTIVE', 'PENDING']),
    supabase.from('transactions').select('*', { count: 'exact', head: true }).eq('org_id', orgId),
    supabase.from('contacts').select('*', { count: 'exact', head: true }).eq('org_id', orgId)
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
      .select('org_id, role')
      .eq('auth_id', userData.user.id)
      .single()

    if (!profile?.org_id) return { error: 'No organization found' }
    if (!['SUPER_ADMIN', 'ADMIN'].includes(profile.role)) {
      return { error: 'Unauthorized: Only administrators can invite users' }
    }

    const { createAdminClient } = await import('@/utils/supabase/admin')
    const adminClient = createAdminClient()

    // 1. Invite the user via Supabase Auth email
    const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
      data: { role: role, org_id: profile.org_id }
    })

    if (inviteError) {
      console.error('Error sending invite:', inviteError)
      return { error: `Failed to send invite: ${inviteError.message}` }
    }

    // 2. Link in public.users table
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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred.'
    return { error: message }
  }
}

export async function generateWhatsAppInvite(email: string, role: string) {
  try {
    const supabase = await createClient()
    
    const { data: userData } = await supabase.auth.getUser()
    if (!userData?.user) return { error: 'Not authenticated' }

    const { data: profile } = await supabase
      .from('users')
      .select('org_id, role')
      .eq('auth_id', userData.user.id)
      .single()

    if (!profile?.org_id) return { error: 'No organization found' }
    if (!['SUPER_ADMIN', 'ADMIN'].includes(profile.role)) {
      return { error: 'Unauthorized: Only administrators can generate invite links' }
    }

    const { createAdminClient } = await import('@/utils/supabase/admin')
    const adminClient = createAdminClient()

    // 1. Generate the invite link via Supabase Auth
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

    // 2. Insert into users table
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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred.'
    return { error: message }
  }
}

