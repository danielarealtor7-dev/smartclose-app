'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Calendar, 
  Files, 
  FolderClosed, 
  Home, 
  Settings, 
  Users,
  Menu,
  X
} from 'lucide-react'

const navigation = [
  { name: 'Today', href: '/dashboard/today', icon: Home },
  { name: 'Transactions', href: '/dashboard/transactions', icon: Files },
  { name: 'Calendar', href: '/dashboard/calendar', icon: Calendar },
  { name: 'Contacts', href: '/dashboard/contacts', icon: Users },
  { name: 'Templates', href: '/dashboard/templates', icon: Files },
  { name: 'Archive', href: '/dashboard/archive', icon: FolderClosed },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="md:hidden">
      {/* Mobile menu button */}
      <button
        type="button"
        className="p-2 -ml-2 mr-2 rounded-md text-gray-500 hover:text-brand-black focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-gold min-h-[44px] min-w-[44px] flex items-center justify-center"
        onClick={() => setIsOpen(true)}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Off-canvas menu */}
      {isOpen && (
        <div className="relative z-40 md:hidden" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsOpen(false)} />

          <div className="fixed inset-0 flex z-40">
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-brand-black">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white min-h-[44px] min-w-[44px]"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="sr-only">Close sidebar</span>
                  <X className="h-6 w-6 text-white" aria-hidden="true" />
                </button>
              </div>

              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div className="flex-shrink-0 flex items-center px-4">
                  <span className="text-xl font-bold text-white tracking-tight">SmartClose TC</span>
                </div>
                <nav className="mt-8 px-2 space-y-1">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`
                          group flex items-center px-2 py-3 text-base font-medium rounded-md
                          ${isActive 
                            ? 'bg-brand-gold text-brand-black' 
                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                          }
                        `}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <item.icon
                          className={`flex-shrink-0 mr-4 h-6 w-6 ${
                            isActive ? 'text-brand-black' : 'text-gray-400 group-hover:text-gray-300'
                          }`}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    )
                  })}
                </nav>
              </div>
            </div>
            <div className="flex-shrink-0 w-14" aria-hidden="true" />
          </div>
        </div>
      )}
    </div>
  )
}
