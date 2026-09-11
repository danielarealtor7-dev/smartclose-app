import { redirect } from 'next/navigation'

export default function Home() {
  // Redirect root to dashboard. Middleware handles auth checks.
  redirect('/dashboard')
}
