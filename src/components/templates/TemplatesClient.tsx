'use client'

import { useState } from 'react'
import { Files, Plus, X, Pencil, Trash2 } from 'lucide-react'
import { createEmailTemplate, updateEmailTemplate, deleteEmailTemplate } from '@/app/actions/templates'
import { EmptyState } from '@/components/ui/EmptyState'
import { useRouter } from 'next/navigation'

interface EmailTemplateItem {
  id: string
  name: string
  subject: string
  body: string
}

export function TemplatesClient({ initialTemplates }: { initialTemplates: EmailTemplateItem[] }) {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplateItem | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = editingTemplate
      ? await updateEmailTemplate(editingTemplate.id, formData)
      : await createEmailTemplate(formData)

    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
    } else {
      setIsModalOpen(false)
      setEditingTemplate(null)
      setIsSubmitting(false)
      router.refresh()
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete template "${name}"?`)) return
    setDeletingId(id)
    const result = await deleteEmailTemplate(id)
    setDeletingId(null)
    if (result?.error) {
      alert(result.error)
    } else {
      router.refresh()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-black tracking-tight">Email Templates</h1>
          <p className="mt-1 text-sm text-text-muted">Manage standard email templates for your communications.</p>
        </div>
        <button 
          onClick={() => {
            setEditingTemplate(null)
            setIsModalOpen(true)
          }}
          className="inline-flex items-center px-4 py-2 text-sm font-semibold bg-brand-gold text-brand-black rounded-lg hover:bg-gold-hover transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </button>
      </div>

      {initialTemplates.length === 0 ? (
        <EmptyState 
          title="No templates found"
          description="Create email templates to speed up communication with clients and agents."
          icon={Files}
          actionLabel="Create Template"
          onAction={() => {
            setEditingTemplate(null)
            setIsModalOpen(true)
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {initialTemplates.map((t) => (
            <div key={t.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-brand-black">{t.name}</h3>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => {
                        setEditingTemplate(t)
                        setIsModalOpen(true)
                      }}
                      className="p-1 text-gray-400 hover:text-brand-black hover:bg-gray-100 rounded transition-colors"
                      title="Edit Template"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(t.id, t.name)}
                      disabled={deletingId === t.id}
                      className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                      title="Delete Template"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3 font-medium">Subject: {t.subject}</p>
                <div className="text-sm text-gray-500 line-clamp-3 bg-gray-50 p-3 rounded border border-gray-100">
                  {t.body}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
              <h2 className="text-lg font-semibold text-brand-black">{editingTemplate ? 'Edit Email Template' : 'Create Email Template'}</h2>
              <button 
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingTemplate(null)
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-700 bg-red-50 rounded-md border border-red-100">
                  {error}
                </div>
              )}
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Template Name *
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  defaultValue={editingTemplate?.name || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold outline-none transition-all"
                  placeholder="e.g. Introduction to Seller"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  id="subject"
                  required
                  defaultValue={editingTemplate?.subject || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold outline-none transition-all"
                  placeholder="e.g. Introduction - {{property_address}}"
                />
              </div>

              <div>
                <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Body *
                </label>
                <textarea
                  name="body"
                  id="body"
                  rows={6}
                  required
                  defaultValue={editingTemplate?.body || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold outline-none transition-all"
                  placeholder="Hello {{buyer_name}}, welcome to the transaction..."
                />
                <p className="mt-1 text-xs text-text-muted">
                  You can use variables like: <code>&#123;&#123;property_address&#125;&#125;</code>, <code>&#123;&#123;closing_date&#125;&#125;</code>
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false)
                    setEditingTemplate(null)
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-semibold bg-brand-gold text-brand-black hover:bg-gold-hover rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : (editingTemplate ? 'Update Template' : 'Create Template')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
