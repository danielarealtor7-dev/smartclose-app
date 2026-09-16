'use client'

import { Search, UserCircle, LogOut } from 'lucide-react'
import { MobileNav } from './MobileNav'
import { useState } from 'react'

export function Header() {
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow-sm border-b border-gray-200">
      <MobileNav />

      <div className="flex flex-1 justify-between px-4 sm:px-6 md:px-8">
        <div className="flex flex-1">
          <form className="flex w-full md:ml-0" action="#" method="GET">
            <label htmlFor="search-field" className="sr-only">
              Search
            </label>
            <div className="relative w-full text-gray-400 focus-within:text-gray-600">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center">
                <Search className="h-5 w-5" aria-hidden="true" />
              </div>
              <input
                id="search-field"
                className="block h-full w-full border-transparent py-2 pl-8 pr-3 text-gray-900 placeholder-gray-500 focus:border-transparent focus:placeholder-gray-400 focus:outline-none focus:ring-0 sm:text-sm"
                placeholder="Search transactions, contacts..."
                type="search"
                name="search"
                disabled
              />
            </div>
          </form>
        </div>
        
        <div className="ml-4 flex items-center md:ml-6">
          {/* Profile dropdown */}
          <div className="relative ml-3">
            <div>
              <button
                type="button"
                className="flex max-w-xs items-center rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2 min-h-[44px] min-w-[44px]"
                id="user-menu-button"
                aria-expanded={profileOpen}
                aria-haspopup="true"
                onClick={() => setProfileOpen(!profileOpen)}
              >
                <span className="sr-only">Open user menu</span>
                <UserCircle className="h-8 w-8 text-gray-400" />
              </button>
            </div>

            {profileOpen && (
              <div
                className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="user-menu-button"
                tabIndex={-1}
              >
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-brand-black">Daniela</p>
                  <p className="text-xs text-text-muted truncate">SmartClose TC</p>
                </div>
                <form action="/auth/signout" method="POST">
                  <button
                    type="submit"
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 min-h-[44px]"
                    role="menuitem"
                    tabIndex={-1}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
