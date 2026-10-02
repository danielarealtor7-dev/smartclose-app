'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Tab {
  name: string
  href: string
}

export function TransactionTabs({ tabs }: { tabs: Tab[] }) {
  const pathname = usePathname()

  return (
    <nav className="flex space-x-1 overflow-x-auto" aria-label="Transaction tabs">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href
        return (
          <Link
            key={tab.name}
            href={tab.href}
            className={
              'whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm transition-colors ' +
              (isActive
                ? 'border-brand-gold text-brand-gold'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300')
            }
          >
            {tab.name}
          </Link>
        )
      })}
    </nav>
  )
}