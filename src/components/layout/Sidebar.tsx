'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Calendar, 
  Files, 
  FolderClosed, 
  Home, 
  Settings, 
  Users,
  ShieldCheck
} from 'lucide-react'

const navigation = [
  { name: 'Today', href: '/dashboard/today', icon: Home },
  { name: 'Transactions', href: '/dashboard/transactions', icon: Files },
  { name: 'Calendar', href: '/dashboard/calendar', icon: Calendar },
  { name: 'Contacts', href: '/dashboard/contacts', icon: Users },
  { name: 'Templates', href: '/dashboard/templates', icon: Files },
  { name: 'Archive', href: '/dashboard/archive', icon: FolderClosed },
  { name: 'Admin', href: '/dashboard/admin', icon: ShieldCheck },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-brand-black">
      <div className="flex flex-col flex-1 min-h-0 pt-5 pb-4">
        <div className="flex items-center flex-shrink-0 px-6">
          <span className="text-xl font-bold text-white tracking-tight">SmartClose TC</span>
        </div>
        <nav className="mt-8 flex-1 px-3 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors
                  ${isActive 
                    ? 'bg-brand-gold text-brand-black' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                <item.icon
                  className={`flex-shrink-0 mr-3 h-5 w-5 ${
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
  )
}
