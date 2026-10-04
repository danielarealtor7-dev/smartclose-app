'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Pencil, Archive, ArchiveRestore, Trash2 } from 'lucide-react'
import { archiveTransaction, restoreTransaction, deleteTransaction } from '@/app/dashboard/transactions/actions'

interface TransactionDetailActionsProps {
  id: string
  address: string
  isArchived?: boolean
}

export function TransactionDetailActions({ id, address, isArchived }: TransactionDetailActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleArchive = async () => {
    if (!window.confirm(`¿Deseas archivar la transacción de "${address}"?`)) return
    setLoading(true)
    const res = await archiveTransaction(id)
    setLoading(false)
    if (res?.error) {
      alert(res.error)
    } else {
      router.push('/dashboard/transactions')
    }
  }

  const handleRestore = async () => {
    if (!window.confirm(`¿Deseas restaurar la transacción de "${address}" al listado activo?`)) return
    setLoading(true)
    const res = await restoreTransaction(id)
    setLoading(false)
    if (res?.error) {
      alert(res.error)
    } else {
      router.refresh()
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`¿Estás seguro de eliminar permanentemente la transacción "${address}"? Esta acción no se puede deshacer.`)) {
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
        <span>Editar</span>
      </Link>
      {!isArchived ? (
        <button 
          onClick={handleArchive}
          disabled={loading}
          className="px-3 py-1.5 text-sm font-medium text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-md hover:bg-yellow-100 focus:outline-none min-h-[40px] flex items-center gap-1.5 transition-colors disabled:opacity-50"
          title="Archivar Transacción"
        >
          <Archive className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Archivar</span>
        </button>
      ) : (
        <button 
          onClick={handleRestore}
          disabled={loading}
          className="px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md hover:bg-emerald-100 focus:outline-none min-h-[40px] flex items-center gap-1.5 transition-colors disabled:opacity-50"
          title="Restaurar Transacción"
        >
          <ArchiveRestore className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Restaurar</span>
        </button>
      )}
      <button 
        onClick={handleDelete}
        disabled={loading}
        className="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none min-h-[40px] flex items-center gap-1.5 transition-colors disabled:opacity-50"
        title="Eliminar Transacción"
      >
        <Trash2 className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Eliminar</span>
      </button>
    </div>
  )
}

