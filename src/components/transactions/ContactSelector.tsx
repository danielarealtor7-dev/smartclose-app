'use client'

import { useState, useEffect } from 'react'
import { getContactsByRole, createContact } from '@/app/actions/contacts'
import { Plus } from 'lucide-react'

interface ContactSelectorProps {
  label: string
  roleType: string
  value?: string | null
  onChange: (id: string | null) => void
  error?: string
}

export function ContactSelector({ label, roleType, value, onChange, error }: ContactSelectorProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [contacts, setContacts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [newContactName, setNewContactName] = useState('')
  const [isCreatingSubmit, setIsCreatingSubmit] = useState(false)

  useEffect(() => {
    const loadContacts = async () => {
      setLoading(true)
      const res = await getContactsByRole(roleType)
      if (res.data) {
        setContacts(res.data)
      }
      setLoading(false)
    }
    loadContacts()
  }, [roleType])

  const handleCreate = async () => {
    if (!newContactName.trim()) return
    setIsCreatingSubmit(true)
    
    // Simple split for first and last name
    const parts = newContactName.trim().split(' ')
    const firstName = parts[0]
    const lastName = parts.length > 1 ? parts.slice(1).join(' ') : ''

    const res = await createContact({
      first_name: firstName,
      last_name: lastName,
      role_type: roleType
    })

    if (res.data) {
      setContacts(prev => [...prev, res.data])
      onChange(res.data.id)
      setIsCreating(false)
      setNewContactName('')
    }
    setIsCreatingSubmit(false)
  }

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-brand-black mb-1">{label}</label>
      
      {!isCreating ? (
        <div className="flex space-x-2">
          <select
            className="flex-1 rounded-md border border-gray-300 p-2 focus:ring-brand-gold focus:border-brand-gold min-h-[44px]"
            value={value || ''}
            onChange={(e) => onChange(e.target.value || null)}
            disabled={loading}
          >
            <option value="">{loading ? 'Loading...' : 'Select a contact...'}</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.first_name} {c.last_name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 hover:bg-gray-100 flex items-center justify-center min-h-[44px]"
            title="Create new contact"
          >
            <Plus className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      ) : (
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Full Name (e.g. John Doe)"
            value={newContactName}
            onChange={(e) => setNewContactName(e.target.value)}
            className="flex-1 rounded-md border border-gray-300 p-2 focus:ring-brand-gold focus:border-brand-gold min-h-[44px]"
            autoFocus
          />
          <button
            type="button"
            onClick={handleCreate}
            disabled={isCreatingSubmit || !newContactName.trim()}
            className="px-4 py-2 bg-brand-gold text-brand-black font-medium rounded-md hover:bg-gold-hover disabled:opacity-50 min-h-[44px]"
          >
            {isCreatingSubmit ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsCreating(false)
              setNewContactName('')
            }}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 border border-transparent min-h-[44px]"
          >
            Cancel
          </button>
        </div>
      )}
      
      {error && <span className="text-danger text-xs mt-1 block">{error}</span>}
    </div>
  )
}
