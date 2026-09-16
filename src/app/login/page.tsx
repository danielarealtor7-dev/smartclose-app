import { login } from './actions'
import { Suspense } from 'react'

function LoginStates({ searchParams }: { searchParams: { error?: string, message?: string } }) {
  if (searchParams.error === 'invalid_credentials') {
    return <div className="mb-4 rounded-md bg-danger/10 p-3 text-sm text-danger border border-danger/20">Invalid email or password.</div>
  }
  if (searchParams.error === 'connection_error') {
    return <div className="mb-4 rounded-md bg-danger/10 p-3 text-sm text-danger border border-danger/20">A connection error occurred. Please try again.</div>
  }
  if (searchParams.error === 'session_expired') {
    return <div className="mb-4 rounded-md bg-yellow-500/10 p-3 text-sm text-yellow-700 border border-yellow-500/20">Your session has expired. Please log in again.</div>
  }
  if (searchParams.error === 'access_denied') {
    return <div className="mb-4 rounded-md bg-danger/10 p-3 text-sm text-danger border border-danger/20">Access denied. You do not have permission to view this page.</div>
  }
  if (searchParams.message === 'password_updated') {
    return <div className="mb-4 rounded-md bg-green-500/10 p-3 text-sm text-green-700 border border-green-500/20">Password updated successfully. You can now log in.</div>
  }
  return null
}

interface LoginPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
  const resolvedSearchParams = await searchParams
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-soft p-4 font-sans">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-sm border-t-4 border-brand-gold">
        <div className="text-center">
          <h2 className="mt-2 text-3xl font-bold text-brand-black tracking-tight">
            SmartClose TC
          </h2>
          <p className="mt-2 text-sm text-text-muted">
            Sign in to access your portal
          </p>
        </div>
        
        <Suspense>
          <LoginStates searchParams={resolvedSearchParams as Record<string, string>} />
        </Suspense>

        <form className="mt-8 space-y-6" action={login}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-brand-black mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-text-main placeholder-gray-400 focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold sm:text-sm"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-brand-black">
                  Password
                </label>
                <a href="/forgot-password" className="text-xs font-medium text-brand-gold hover:text-gold-hover">
                  Forgot password?
                </a>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-text-main placeholder-gray-400 focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold sm:text-sm"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-brand-gold px-4 py-2.5 text-sm font-semibold text-brand-black transition-colors hover:bg-gold-hover focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
