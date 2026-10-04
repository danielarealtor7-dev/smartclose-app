'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, Pencil, Archive, ArchiveRestore, Trash2 } from 'lucide-react'
import { archiveTransaction, restoreTransaction, deleteTransaction } from '@/app/dashboard/transactions/actions'

interface TransactionRowActionsProps {
  id: string
  address: string
  isArchived?: boolean
}

export function TransactionRowActions({ id, address, isArchived }: TransactionRowActionsProps) {
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
      router.refresh()
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
      router.refresh()
    }
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      <Link 
        href={`/dashboard/transactions/${id}`} 
        className="p-1.5 text-gray-500 hover:text-brand-gold hover:bg-gray-100 rounded-md transition-colors"
        title="Ver Detalle"
      >
        <Eye className="w-4 h-4" />
      </Link>
      <Link 
        href={`/dashboard/transactions/${id}/edit`} 
        className="p-1.5 text-gray-500 hover:text-brand-black hover:bg-gray-100 rounded-md transition-colors"
        title="Editar"
      >
        <Pencil className="w-4 h-4" />
      </Link>
      {!isArchived ? (
        <button 
          onClick={handleArchive}
          disabled={loading}
          className="p-1.5 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-md transition-colors disabled:opacity-50"
          title="Archivar Transacción"
        >
          <Archive className="w-4 h-4" />
        </button>
      ) : (
        <button 
          onClick={handleRestore}
          disabled={loading}
          className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors disabled:opacity-50"
          title="Restaurar Transacción"
        >
          <ArchiveRestore className="w-4 h-4" />
        </button>
      )}
      <button 
        onClick={handleDelete}
        disabled={loading}
        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
        title="Eliminar Permanentemente"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}

