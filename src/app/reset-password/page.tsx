import { resetPassword } from '../login/actions'
import { Suspense } from 'react'

function ResetStates({ searchParams }: { searchParams: { error?: string } }) {
  if (searchParams.error === 'connection_error') {
    return <div className="mb-4 rounded-md bg-danger/10 p-3 text-sm text-danger border border-danger/20">A connection error occurred. Please try again.</div>
  }
  if (searchParams.error === 'invalid_password') {
    return <div className="mb-4 rounded-md bg-danger/10 p-3 text-sm text-danger border border-danger/20">Please enter a valid password.</div>
  }
  return null
}

interface ResetPasswordPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const resolvedSearchParams = await searchParams
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-soft p-4 font-sans">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-sm border-t-4 border-brand-gold">
        <div className="text-center">
          <h2 className="mt-2 text-2xl font-bold text-brand-black tracking-tight">
            Create new password
          </h2>
          <p className="mt-2 text-sm text-text-muted">
            Please enter your new password below.
          </p>
        </div>
        
        <Suspense>
          <ResetStates searchParams={resolvedSearchParams as Record<string, string>} />
        </Suspense>

        <form className="mt-8 space-y-6" action={resetPassword}>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-brand-black mb-1">
              New Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-text-main placeholder-gray-400 focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold sm:text-sm"
            />
          </div>

          <div>
            <button
              type="submit"
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-brand-gold px-4 py-2.5 text-sm font-semibold text-brand-black transition-colors hover:bg-gold-hover focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2"
            >
              Update password
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
