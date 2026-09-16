import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description: string
  icon: LucideIcon
  actionLabel?: string
}

export function EmptyState({ title, description, icon: Icon, actionLabel }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl bg-white p-12 text-center shadow-sm border border-gray-200">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-gold/10 mb-4">
        <Icon className="h-8 w-8 text-brand-gold" aria-hidden="true" />
      </div>
      <h2 className="text-xl font-semibold text-brand-black mb-2">{title}</h2>
      <p className="text-sm text-text-muted max-w-sm mb-6">{description}</p>
      {actionLabel && (
        <button
          type="button"
          className="rounded-md bg-brand-gold px-4 py-2.5 text-sm font-semibold text-brand-black transition-colors hover:bg-gold-hover focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2 min-h-[44px]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
