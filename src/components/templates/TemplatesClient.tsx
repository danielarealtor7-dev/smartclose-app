'use client'

import { useState } from 'react'
import { Files, Plus, X } from 'lucide-react'
import { createEmailTemplate } from '@/app/actions/templates'
import { EmptyState } from '@/components/ui/EmptyState'

interface EmailTemplateItem {
  id: string
  name: string
  subject: string
  body: string
}

export function TemplatesClient({ initialTemplates }: { initialTemplates: EmailTemplateItem[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await createEmailTemplate(formData)

    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
    } else {
      setIsModalOpen(false)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-black tracking-tight">Email Templates</h1>
          <p className="mt-1 text-sm text-text-muted">Manage standard email templates for your communications.</p>
        </div>
        {initialTemplates.length > 0 && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium bg-brand-gold text-brand-black rounded-lg hover:bg-gold-hover transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Template
          </button>
        )}
      </div>

      {initialTemplates.length === 0 ? (
        <EmptyState 
          title="No templates found"
          description="Create email templates to speed up communication with clients and agents."
          icon={Files}
          actionLabel="Create Template"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {initialTemplates.map((t) => (
            <div key={t.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all">
              <h3 className="font-semibold text-brand-black mb-2">{t.name}</h3>
              <p className="text-sm text-gray-600 mb-4 font-medium">Subject: {t.subject}</p>
              <div className="text-sm text-gray-500 line-clamp-3 bg-gray-50 p-3 rounded border border-gray-100">
                {t.body}
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
              <h2 className="text-lg font-semibold text-brand-black">Create Email Template</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold outline-none transition-all"
                  placeholder="Subject line"
                />
              </div>

              <div>
                <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Body *
                </label>
                <textarea
                  name="body"
                  id="body"
                  rows={8}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold outline-none transition-all"
                  placeholder="Dear [Client Name]..."
                />
                <p className="text-xs text-gray-500 mt-1">You can use placeholders like [Client Name] or [Property Address]</p>
              </div>

              <div className="pt-4 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium bg-brand-gold text-brand-black rounded-lg hover:bg-gold-hover transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
