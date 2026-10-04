'use client'

import { useState } from 'react'
import { FileText, Plus, X, Pencil, Trash2 } from 'lucide-react'
import { createTaskTemplate, updateTaskTemplate, deleteTaskTemplate } from '@/app/actions/settings'
import { useRouter } from 'next/navigation'

interface TemplateItem {
  id: string
  name: string
  description?: string | null
  transaction_side?: string | null
  condition_financing_type?: string | null
  condition_property_type?: string | null
}

export function SettingsClient({ initialTemplates }: { initialTemplates: TemplateItem[] }) {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<TemplateItem | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = editingTemplate
      ? await updateTaskTemplate(editingTemplate.id, formData)
      : await createTaskTemplate(formData)

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
    const result = await deleteTaskTemplate(id)
    setDeletingId(null)
    if (result?.error) {
      alert(result.error)
    } else {
      router.refresh()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-black tracking-tight">Settings & Templates</h1>
        <p className="mt-1 text-sm text-text-muted">Manage your organization templates and conditional logic.</p>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-brand-black flex items-center">
            <FileText className="w-5 h-5 mr-2 text-brand-gold" />
            Task Templates
          </h2>
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
        <div className="p-0">
          {initialTemplates.length === 0 ? (
            <div className="p-8 text-center text-text-muted">
              No templates found. Click &quot;New Template&quot; to create one.
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {initialTemplates.map((t) => (
                <li key={t.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-brand-black">{t.name}</h3>
                      <p className="text-sm text-text-muted mt-1">{t.description}</p>
                      
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {t.transaction_side && (
                          <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-100">
                            Side: {t.transaction_side}
                          </span>
                        )}
                        {t.condition_financing_type && (
                          <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-md border border-green-100">
                            Financing: {t.condition_financing_type}
                          </span>
                        )}
                        {t.condition_property_type && (
                          <span className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded-md border border-purple-100">
                            Property: {t.condition_property_type}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          setEditingTemplate(t)
                          setIsModalOpen(true)
                        }}
                        className="p-1.5 text-gray-500 hover:text-brand-black hover:bg-gray-100 rounded-md transition-colors"
                        title="Edit Template"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(t.id, t.name)}
                        disabled={deletingId === t.id}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                        title="Delete Template"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-brand-black">{editingTemplate ? 'Edit Task Template' : 'Create Task Template'}</h2>
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
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                  placeholder="e.g. Standard Buyer Tasks"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  id="description"
                  rows={2}
                  defaultValue={editingTemplate?.description || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold outline-none transition-all"
                  placeholder="Optional description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="transaction_side" className="block text-sm font-medium text-gray-700 mb-1">
                    Side
                  </label>
                  <select
                    name="transaction_side"
                    id="transaction_side"
                    defaultValue={editingTemplate?.transaction_side || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold outline-none bg-white"
                  >
                    <option value="">Any</option>
                    <option value="BUYER">Buyer</option>
                    <option value="SELLER">Seller</option>
                    <option value="DUAL">Dual</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="condition_financing_type" className="block text-sm font-medium text-gray-700 mb-1">
                    Financing
                  </label>
                  <select
                    name="condition_financing_type"
                    id="condition_financing_type"
                    defaultValue={editingTemplate?.condition_financing_type || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold outline-none bg-white"
                  >
                    <option value="">Any</option>
                    <option value="CASH">Cash</option>
                    <option value="CONVENTIONAL">Conventional</option>
                    <option value="FHA">FHA</option>
                    <option value="VA">VA</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="condition_property_type" className="block text-sm font-medium text-gray-700 mb-1">
                  Property Type
                </label>
                <select
                  name="condition_property_type"
                  id="condition_property_type"
                  defaultValue={editingTemplate?.condition_property_type || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold outline-none bg-white"
                >
                  <option value="">Any</option>
                  <option value="SINGLE_FAMILY">Single Family</option>
                  <option value="CONDO">Condo</option>
                  <option value="TOWNHOUSE">Townhouse</option>
                  <option value="MULTI_FAMILY">Multi-Family</option>
                  <option value="COMMERCIAL">Commercial</option>
                  <option value="LAND">Land</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false)
                    setEditingTemplate(null)
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-semibold bg-brand-gold text-brand-black rounded-lg hover:bg-gold-hover transition-colors disabled:opacity-50"
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
