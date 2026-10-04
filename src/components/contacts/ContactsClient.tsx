'use client'

import { useState } from 'react'
import { EmptyState } from '@/components/ui/EmptyState'
import { Users, Mail, Phone, Plus, Pencil, Trash2 } from 'lucide-react'
import { ContactForm, ContactData } from '@/components/contacts/ContactForm'
import { deleteContact } from '@/app/actions/contacts'
import { useRouter } from 'next/navigation'

interface ContactItem {
  id: string
  first_name: string
  last_name?: string | null
  role_type?: string | null
  email?: string | null
  phone?: string | null
}

export function ContactsClient({ initialContacts }: { initialContacts: ContactItem[] }) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [editingContact, setEditingContact] = useState<ContactData | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete contact "${name}"?`)) {
      return
    }

    setDeletingId(id)
    setDeleteError(null)

    const res = await deleteContact(id)
    if (res.error) {
      setDeleteError(res.error)
      setDeletingId(null)
    } else {
      setDeletingId(null)
      router.refresh()
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-brand-black tracking-tight">Contacts</h1>
          <p className="mt-1 text-sm text-text-muted">Manage realtors, title companies, lenders, and clients.</p>
        </div>
        <button 
          onClick={() => {
            setEditingContact(null)
            setShowForm(true)
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-brand-gold text-brand-black font-medium rounded-lg hover:bg-brand-gold-hover transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>Add Contact</span>
        </button>
      </div>

      {deleteError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center justify-between">
          <span>{deleteError}</span>
          <button onClick={() => setDeleteError(null)} className="font-semibold text-xs ml-4 underline">Dismiss</button>
        </div>
      )}
      
      {!initialContacts || initialContacts.length === 0 ? (
        <EmptyState 
          title="No contacts found"
          description="Build your network by adding frequently used realtors, title companies, and lenders."
          icon={Users}
          actionLabel="Add Contact"
          onAction={() => {
            setEditingContact(null)
            setShowForm(true)
          }}
        />
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Info</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {initialContacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-brand-black">{contact.first_name} {contact.last_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-100">
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
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => {
                          setEditingContact(contact)
                          setShowForm(true)
                        }}
                        className="p-1.5 text-gray-500 hover:text-brand-black hover:bg-gray-100 rounded-md transition-colors"
                        title="Edit Contact"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(contact.id, `${contact.first_name} ${contact.last_name || ''}`.trim())}
                        disabled={deletingId === contact.id}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                        title="Delete Contact"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <ContactForm 
          initialData={editingContact}
          onClose={() => {
            setShowForm(false)
            setEditingContact(null)
          }} 
          onSaved={() => router.refresh()}
        />
      )}
    </div>
  )
}

