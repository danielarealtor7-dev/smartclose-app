'use client'

import { useState } from 'react'
import { EmptyState } from '@/components/ui/EmptyState'
import { Users, Mail, Phone, Plus } from 'lucide-react'
import { ContactForm } from '@/components/contacts/ContactForm'

interface ContactItem {
  id: string
  first_name: string
  last_name?: string | null
  role_type?: string | null
  email?: string | null
  phone?: string | null
}

export function ContactsClient({ initialContacts }: { initialContacts: ContactItem[] }) {
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-brand-black tracking-tight">Contacts</h1>
          <p className="mt-1 text-sm text-text-muted">Manage realtors, title companies, lenders, and clients.</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-brand-gold text-brand-black font-medium rounded-lg hover:bg-brand-gold-hover transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Contact</span>
        </button>
      </div>
      
      {!initialContacts || initialContacts.length === 0 ? (
        <EmptyState 
          title="No contacts found"
          description="Build your network by adding frequently used realtors, title companies, and lenders."
          icon={Users}
          actionLabel="Add Contact"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Info</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {initialContacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-brand-black">{contact.first_name} {contact.last_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {contact.role_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {contact.email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{contact.email}</span>
                      </div>
                    )}
                    {contact.phone && (
                      <div className="flex items-center space-x-2 mt-1">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{contact.phone}</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <ContactForm onClose={() => setShowForm(false)} />
      )}
    </div>
  )
}
