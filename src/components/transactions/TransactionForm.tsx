'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { TransactionSchema, Transaction } from '@/types'
import type { z } from 'zod'
import { createTransaction, updateTransaction } from '@/app/dashboard/transactions/actions'
import { useRouter } from 'next/navigation'
import { TasksDiffModal } from './TasksDiffModal'
import { diffTransactionTasks, applyTransactionTasksDiff } from '@/app/actions/tasks'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface TransactionFormProps {
  initialData?: Transaction
}

function Accordion({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  
  return (
    <div className="border border-gray-200 rounded-md overflow-hidden bg-white mb-4">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-gold min-h-[44px]"
      >
        <span className="font-semibold text-brand-black">{title}</span>
        {isOpen ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
      </button>
      {isOpen && <div className="p-4 border-t border-gray-200 space-y-4">{children}</div>}
    </div>
  )
}

export function TransactionForm({ initialData }: TransactionFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [diffModalOpen, setDiffModalOpen] = useState(false)
  const [taskDiff, setTaskDiff] = useState<any>(null)
  const [pendingData, setPendingData] = useState<any>(null)
  const [isApplyingDiff, setIsApplyingDiff] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(TransactionSchema),
    defaultValues: initialData || {
      property_type: 'SINGLE_FAMILY',
      transaction_side: 'BUYER',
      financing_type: 'CONVENTIONAL',
      status: 'ACTIVE',
      is_archived: false,
    }
  })

  const executeSave = async (data: any, addedTasks?: any[], removedTaskIds?: string[]) => {
    setIsSubmitting(true)
    setError(null)
    try {
      const response = initialData?.id 
        ? await updateTransaction(initialData.id, data)
        : await createTransaction(data)
        
      if (response.error) {
        setError(response.error)
        setIsSubmitting(false)
        return
      }

      if (initialData?.id && addedTasks && removedTaskIds) {
        await applyTransactionTasksDiff(initialData.id, addedTasks, removedTaskIds)
      }

      router.push(`/dashboard/transactions/${response.data.id}`)
    } catch {
      setError('An unexpected error occurred.')
      setIsSubmitting(false)
    }
  }

  const onSubmit = async (data: z.infer<typeof TransactionSchema>) => {
    if (!initialData?.id) {
      // Creating new, just save it (Task generation will be a separate hook or action later, 
      // but for this phase we focus on the edit diff rule).
      return executeSave(data)
    }

    const sideChanged = initialData.transaction_side !== data.transaction_side
    const propChanged = initialData.property_type !== data.property_type
    const finChanged = initialData.financing_type !== data.financing_type

    if (sideChanged || propChanged || finChanged) {
      setIsSubmitting(true)
      try {
        const diff = await diffTransactionTasks(initialData.id, data.transaction_side, data.property_type, data.financing_type)
        if (diff.added.length > 0 || diff.removed.length > 0) {
          setTaskDiff(diff)
          setPendingData(data)
          setDiffModalOpen(true)
          setIsSubmitting(false)
          return
        }
      } catch (e) {
        console.error('Diff error', e)
        // If diff fails, fallback to normal save or show error
      }
    }

    // No relevant changes or no diff found, save normally
    return executeSave(data)
  }
  
  const onConfirmDiff = async () => {
    if (!pendingData || !taskDiff) return
    setIsApplyingDiff(true)
    const removedIds = taskDiff.removed.map((t: any) => t.id)
    await executeSave(pendingData, taskDiff.added, removedIds)
    setIsApplyingDiff(false)
    setDiffModalOpen(false)
  }

  return (
    <>
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl">
      {error && (
        <div className="bg-danger/10 border border-danger/20 text-danger p-4 rounded-md">
          {error}
        </div>
      )}

      <Accordion title="Property & Basics" defaultOpen={true}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-brand-black mb-1">Transaction Side</label>
            <select {...register('transaction_side')} className="w-full rounded-md border border-gray-300 p-2 focus:ring-brand-gold focus:border-brand-gold min-h-[44px]">
              <option value="BUYER">Buyer</option>
              <option value="LISTING">Listing</option>
              <option value="DUAL">Dual</option>
            </select>
            {errors.transaction_side && <span className="text-danger text-xs">{errors.transaction_side.message}</span>}
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-black mb-1">Property Type</label>
            <select {...register('property_type')} className="w-full rounded-md border border-gray-300 p-2 focus:ring-brand-gold focus:border-brand-gold min-h-[44px]">
              <option value="SINGLE_FAMILY">Single Family</option>
              <option value="CONDO">Condo</option>
              <option value="MANUFACTURED">Manufactured Home</option>
              <option value="NEW_CONSTRUCTION">New Construction</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-brand-black mb-1">Property Address</label>
            <input {...register('property_address')} type="text" className="w-full rounded-md border border-gray-300 p-2 focus:ring-brand-gold focus:border-brand-gold min-h-[44px]" />
            {errors.property_address && <span className="text-danger text-xs">{errors.property_address.message}</span>}
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-black mb-1">City</label>
            <input {...register('city')} type="text" className="w-full rounded-md border border-gray-300 p-2 focus:ring-brand-gold focus:border-brand-gold min-h-[44px]" />
            {errors.city && <span className="text-danger text-xs">{errors.city.message}</span>}
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-black mb-1">State</label>
            <input {...register('state')} type="text" className="w-full rounded-md border border-gray-300 p-2 focus:ring-brand-gold focus:border-brand-gold min-h-[44px]" />
            {errors.state && <span className="text-danger text-xs">{errors.state.message}</span>}
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-black mb-1">ZIP Code</label>
            <input {...register('zip_code')} type="text" className="w-full rounded-md border border-gray-300 p-2 focus:ring-brand-gold focus:border-brand-gold min-h-[44px]" />
            {errors.zip_code && <span className="text-danger text-xs">{errors.zip_code.message}</span>}
          </div>
        </div>
      </Accordion>

      <Accordion title="Financials & Dates" defaultOpen={true}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-brand-black mb-1">Purchase Price ($)</label>
            <input {...register('price')} type="number" step="0.01" className="w-full rounded-md border border-gray-300 p-2 focus:ring-brand-gold focus:border-brand-gold min-h-[44px]" />
            {errors.price && <span className="text-danger text-xs">{errors.price.message}</span>}
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-black mb-1">EMD Amount ($)</label>
            <input {...register('emd_amount')} type="number" step="0.01" className="w-full rounded-md border border-gray-300 p-2 focus:ring-brand-gold focus:border-brand-gold min-h-[44px]" />
            {errors.emd_amount && <span className="text-danger text-xs">{errors.emd_amount.message}</span>}
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-black mb-1">Financing Type</label>
            <select {...register('financing_type')} className="w-full rounded-md border border-gray-300 p-2 focus:ring-brand-gold focus:border-brand-gold min-h-[44px]">
              <option value="CONVENTIONAL">Conventional</option>
              <option value="FHA">FHA</option>
              <option value="VA">VA</option>
              <option value="CASH">Cash</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div></div>
          <div>
            <label className="block text-sm font-medium text-brand-black mb-1">Effective Date</label>
            <input {...register('effective_date')} type="date" className="w-full rounded-md border border-gray-300 p-2 focus:ring-brand-gold focus:border-brand-gold min-h-[44px]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-black mb-1">Closing Date</label>
            <input {...register('closing_date')} type="date" className="w-full rounded-md border border-gray-300 p-2 focus:ring-brand-gold focus:border-brand-gold min-h-[44px]" />
          </div>
        </div>
      </Accordion>

      <Accordion title="Clients (Buyers / Sellers)" defaultOpen={false}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-brand-black mb-1">Buyer(s) Names</label>
            <input {...register('buyer_names')} type="text" placeholder="John Doe, Jane Doe" className="w-full rounded-md border border-gray-300 p-2 focus:ring-brand-gold focus:border-brand-gold min-h-[44px]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-black mb-1">Seller(s) Names</label>
            <input {...register('seller_names')} type="text" placeholder="Acme Corp" className="w-full rounded-md border border-gray-300 p-2 focus:ring-brand-gold focus:border-brand-gold min-h-[44px]" />
          </div>
        </div>
      </Accordion>
      
      <Accordion title="Notes" defaultOpen={false}>
        <div>
          <label className="block text-sm font-medium text-brand-black mb-1">Additional Notes</label>
          <textarea {...register('notes')} rows={4} className="w-full rounded-md border border-gray-300 p-2 focus:ring-brand-gold focus:border-brand-gold min-h-[44px]" />
        </div>
      </Accordion>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-gold min-h-[44px]"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-brand-black bg-brand-gold rounded-md hover:bg-gold-hover focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2 disabled:opacity-50 min-h-[44px]"
        >
          {isSubmitting ? 'Saving...' : initialData ? 'Update Transaction' : 'Create Transaction'}
        </button>
      </div>
    </form>
      <TasksDiffModal 
        isOpen={diffModalOpen}
        onClose={() => {
          setDiffModalOpen(false)
          setPendingData(null)
          setTaskDiff(null)
        }}
        onConfirm={onConfirmDiff}
        diff={taskDiff}
        isApplying={isApplyingDiff}
      />
    </>
  )
}
