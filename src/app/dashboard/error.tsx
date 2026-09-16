'use client'

import { useEffect } from 'react'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl bg-white p-8 text-center shadow-sm border border-danger/20">
      <h2 className="text-xl font-bold text-danger mb-2">Something went wrong!</h2>
      <p className="text-text-muted mb-6">An unexpected error occurred while loading this page.</p>
      <button
        onClick={() => reset()}
        className="rounded-md bg-brand-gold px-4 py-2 text-sm font-semibold text-brand-black transition-colors hover:bg-gold-hover focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2"
      >
        Try again
      </button>
    </div>
  )
}
