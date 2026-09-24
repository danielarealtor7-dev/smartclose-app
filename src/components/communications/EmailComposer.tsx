/* eslint-disable */
'use client'

import { useState, useEffect } from 'react'
import { EmailTemplate, Transaction } from '@/types'
import { interpolateTemplate } from '@/utils/template-interpolation'
import { AlertTriangle, Copy, Send, Save, Mail, Users } from 'lucide-react'
import { createCommunicationLog } from '@/app/actions/communications'

interface EmailComposerProps {
  transaction: Transaction
  templates: EmailTemplate[]
  onSuccess?: () => void
}

export function EmailComposer({ transaction, templates, onSuccess }: EmailComposerProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [missingVars, setMissingVars] = useState<string[]>([])
  const [recipient, setRecipient] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  // Example contacts (In reality, we would pass these as props or fetch them)
  const [additionalData] = useState({
    tc_name: 'Sarah Coordinator', // Logged in user mock
    title_contact: 'Title Agent',
    title_company: 'Secure Title LLC',
    lender_name: 'Mortgage Corp',
  })

  useEffect(() => {
    const isMounted = true;
    if (!selectedTemplateId) {
      if (isMounted) {
        setSubject('')
        setBody('')
        setMissingVars([])
      }
      return
    }

    const template = templates.find(t => t.id === selectedTemplateId)
    if (!template) return

    const interpolatedSubject = interpolateTemplate(template.subject_template, transaction, additionalData)
    const interpolatedBody = interpolateTemplate(template.body_template, transaction, additionalData)

    setSubject(interpolatedSubject.result)
    // Basic unescaping for the textarea edit view, ideally we use a rich text editor
    // but for textarea we just replace the HTML entities back or let textarea handle it.
    const rawBody = interpolatedBody.result
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'");

    setBody(rawBody)

    const allMissing = Array.from(new Set([...interpolatedSubject.missingVariables, ...interpolatedBody.missingVariables]))
    setMissingVars(allMissing)

  }, [selectedTemplateId, transaction, templates, additionalData])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy', err)
    }
  }

  const handleSaveDraft = async () => {
    if (!subject || !body) return
    setIsSaving(true)
    
    await createCommunicationLog({
      transaction_id: transaction.id,
      type: 'Email Draft',
      method: 'Email',
      subject: subject,
      summary: body.substring(0, 100) + (body.length > 100 ? '...' : ''),
    })
    
    setIsSaving(false)
    if (onSuccess) onSuccess()
  }

  const handleLogSent = async () => {
    if (!subject || !body) return
    setIsSaving(true)
    
    await createCommunicationLog({
      transaction_id: transaction.id,
      type: 'Email Sent',
      method: 'Email',
      subject: subject,
      summary: `To: ${recipient || 'Unknown'}\n\n${body.substring(0, 100)}...`,
    })
    
    setIsSaving(false)
    if (onSuccess) onSuccess()
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
        <Mail className="w-5 h-5 text-brand-gold" />
        <h3 className="font-semibold text-brand-black">Compose Email</h3>
      </div>

      <div className="p-5 flex-1 overflow-y-auto space-y-4">
        {/* Template Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Template</label>
          <select 
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-gold focus:ring-1 focus:ring-brand-gold"
            value={selectedTemplateId}
            onChange={(e) => setSelectedTemplateId(e.target.value)}
          >
            <option value="">-- Custom Email / No Template --</option>
            {templates.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        {/* Missing Variables Warning */}
        {missingVars.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex gap-3 text-amber-800 text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500" />
            <div>
              <p className="font-medium">Missing data for template variables:</p>
              <ul className="list-disc ml-5 mt-1">
                {missingVars.map(v => (
                  <li key={v}>{v}</li>
                ))}
              </ul>
              <p className="mt-1 text-xs text-amber-700">Please review the body and replace the placeholders manually.</p>
            </div>
          </div>
        )}

        {/* Recipient Suggestion (Mock for now, would use contacts) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
            <Users className="w-4 h-4" /> Recipient
          </label>
          <input 
            type="text" 
            placeholder="e.g. buyer@example.com, agent@example.com"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-gold focus:ring-1 focus:ring-brand-gold"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
          <input 
            type="text" 
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-gold focus:ring-1 focus:ring-brand-gold font-medium"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-1">Message Body</label>
          <textarea 
            className="w-full flex-1 min-h-[250px] rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-gold focus:ring-1 focus:ring-brand-gold resize-y font-sans"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>
      </div>

      {/* Actions Footer */}
      <div className="px-5 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
        <button 
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-brand-black hover:bg-gray-100 rounded-md transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy to Clipboard'}
        </button>

        <div className="flex gap-2">
          <button 
            onClick={handleSaveDraft}
            disabled={isSaving || !subject || !body}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            Save Draft
          </button>
          
          <button 
            onClick={handleLogSent}
            disabled={isSaving || !subject || !body}
            className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium text-brand-black bg-brand-gold border border-brand-gold rounded-md hover:bg-gold-hover transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            Log as Sent
          </button>
        </div>
      </div>
    </div>
  )
}

function Check({className}: {className?: string}) {
  return <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
}
