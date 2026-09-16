'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    redirect('/login?error=invalid_credentials')
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      redirect('/login?error=invalid_credentials')
    }
    redirect('/login?error=connection_error')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function forgotPassword(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string

  if (!email) {
    redirect('/forgot-password?error=invalid_email')
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`,
  })

  if (error) {
    redirect('/forgot-password?error=connection_error')
  }

  redirect('/forgot-password?message=recovery_sent')
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string

  if (!password) {
    redirect('/reset-password?error=invalid_password')
  }

  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) {
    redirect('/reset-password?error=connection_error')
  }

  redirect('/login?message=password_updated')
}
