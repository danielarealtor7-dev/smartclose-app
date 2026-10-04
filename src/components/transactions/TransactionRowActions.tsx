'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, Pencil, Archive, Trash2 } from 'lucide-react'
import { archiveTransaction, deleteTransaction } from '@/app/dashboard/transactions/actions'

interface TransactionRowActionsProps {
  id: string
  address: string
  isArchived?: boolean
}

export function TransactionRowActions({ id, address, isArchived }: TransactionRowActionsProps) {
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
      router.refresh()
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
      router.refresh()
    }
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      <Link 
        href={`/dashboard/transactions/${id}`} 
        className="p-1.5 text-gray-500 hover:text-brand-gold hover:bg-gray-100 rounded-md transition-colors"
        title="View Transaction"
      >
        <Eye className="w-4 h-4" />
      </Link>
      <Link 
        href={`/dashboard/transactions/${id}/edit`} 
        className="p-1.5 text-gray-500 hover:text-brand-black hover:bg-gray-100 rounded-md transition-colors"
        title="Edit Transaction"
      >
        <Pencil className="w-4 h-4" />
      </Link>
      {!isArchived && (
        <button 
          onClick={handleArchive}
          disabled={loading}
          className="p-1.5 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-md transition-colors disabled:opacity-50"
          title="Archive Transaction"
        >
          <Archive className="w-4 h-4" />
        </button>
      )}
      <button 
        onClick={handleDelete}
        disabled={loading}
        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
        title="Delete Transaction"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}
