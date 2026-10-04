'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Pencil, Archive, Trash2 } from 'lucide-react'
import { archiveTransaction, deleteTransaction } from '@/app/dashboard/transactions/actions'

interface TransactionDetailActionsProps {
  id: string
  address: string
  isArchived?: boolean
}

export function TransactionDetailActions({ id, address, isArchived }: TransactionDetailActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleArchive = async () => {
    if (!window.confirm(`Archive transaction for "${address}"?`)) return
    setLoading(true)
    const res = await archiveTransaction(id)
    setLoading(false)
    if (res?.error) {
      alert(res.error)
    } else {
      router.push('/dashboard/transactions')
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete transaction "${address}"? This action cannot be undone.`)) {
      return
    }
    setLoading(true)
    const res = await deleteTransaction(id)
    setLoading(false)
    if (res?.error) {
      alert(res.error)
    } else {
      router.push('/dashboard/transactions')
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Link 
        href={`/dashboard/transactions/${id}/edit`}
        className="px-3 py-1.5 text-sm font-medium text-brand-black bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none min-h-[40px] flex items-center gap-1.5 shadow-sm transition-colors"
      >
        <Pencil className="w-3.5 h-3.5 text-gray-500" />
        <span>Edit</span>
      </Link>
      {!isArchived && (
        <button 
          onClick={handleArchive}
          disabled={loading}
          className="px-3 py-1.5 text-sm font-medium text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-md hover:bg-yellow-100 focus:outline-none min-h-[40px] flex items-center gap-1.5 transition-colors disabled:opacity-50"
          title="Archive Transaction"
        >
          <Archive className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Archive</span>
        </button>
      )}
      <button 
        onClick={handleDelete}
        disabled={loading}
        className="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none min-h-[40px] flex items-center gap-1.5 transition-colors disabled:opacity-50"
        title="Delete Transaction"
      >
        <Trash2 className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Delete</span>
      </button>
    </div>
  )
}
