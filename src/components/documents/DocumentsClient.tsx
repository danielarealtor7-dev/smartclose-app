'use client'

import { useState } from 'react'
import { 
  FileText, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Search, 
  AlertCircle, 
  Check, 
  Loader2, 
  Link as LinkIcon,
  FileCheck,
  FolderOpen
} from 'lucide-react'
import { createDocument, deleteDocument, DocumentItem } from '@/app/actions/documents'
import { useRouter } from 'next/navigation'

const COMMON_DOC_PRESETS = [
  'Contrato de Compraventa (Executed)',
  'Reporte de Inspección Home Inspection',
  'Reporte 4-Point & Wind Mitigation',
  'Carta de Pre-Aprobación Hipotecaria',
  'Compromiso de Título (Title Commitment)',
  'Estudio de Propiedad (Survey)',
  'Adenda o Enmienda Firmada',
  'Closing Disclosure (CD)'
]

export function DocumentsClient({
  transactionId,
  initialDocuments,
  propertyAddress
}: {
  transactionId: string
  initialDocuments: DocumentItem[]
  propertyAddress: string
}) {
  const router = useRouter()
  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments)
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [fileName, setFileName] = useState('')
  const [filePath, setFilePath] = useState('')
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fileName || !filePath) return
    setLoading(true)
    setError(null)

    try {
      const res = await createDocument(transactionId, {
        file_name: fileName.trim(),
        file_path: filePath.trim()
      })

      if (res.error) {
        setError(res.error)
      } else {
        setSuccess('Documento adjuntado exitosamente.')
        if (res.data) {
          setDocuments(prev => [res.data as DocumentItem, ...prev])
        }
        setIsModalOpen(false)
        setFileName('')
        setFilePath('')
        router.refresh()
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch {
      setError('Ocurrió un error al adjuntar el documento.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar "${name}"?`)) return
    setDeletingId(id)
    setError(null)

    try {
      const res = await deleteDocument(id, transactionId)
      if (res.error) {
        setError(res.error)
      } else {
        setDocuments(prev => prev.filter(d => d.id !== id))
        setSuccess(`Documento eliminado.`)
        router.refresh()
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch {
      setError('Error al eliminar el documento.')
    } finally {
      setDeletingId(null)
    }
  }

  const filteredDocs = documents.filter(d =>
    d.file_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-brand-black flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-brand-gold" />
            Documentos y Archivos
          </h2>
          <p className="text-sm text-text-muted mt-1">
            Gestión de contratos, anexos, reportes y comprobantes de <strong>{propertyAddress}</strong>.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setError(null)
            setIsModalOpen(true)
          }}
          className="inline-flex items-center justify-center gap-2 bg-brand-gold text-brand-black px-4 py-2.5 text-sm font-semibold rounded-lg hover:bg-gold-hover transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Adjuntar Documento
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="flex items-start gap-3 p-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">{error}</div>
          <button onClick={() => setError(null)} className="text-red-500 font-bold text-xs">✕</button>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 p-4 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg">
          <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">{success}</div>
          <button onClick={() => setSuccess(null)} className="text-emerald-500 font-bold text-xs">✕</button>
        </div>
      )}

      {/* Search Bar */}
      {documents.length > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre de documento..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-gold"
          />
        </div>
      )}

      {/* Documents List */}
      {filteredDocs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => {
            const isDeleting = deletingId === doc.id
            const isWebLink = doc.file_path.startsWith('http') || doc.file_path.startsWith('https')

            return (
              <div
                key={doc.id}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition-shadow shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="p-2.5 bg-amber-50 text-brand-gold rounded-lg border border-amber-100">
                      <FileText className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-medium text-gray-400">
                      {new Date(doc.uploaded_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-gray-900 line-clamp-2" title={doc.file_name}>
                    {doc.file_name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 truncate" title={doc.file_path}>
                    {doc.file_path}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
                  <a
                    href={doc.file_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-black hover:text-brand-gold transition-colors"
                  >
                    {isWebLink ? <ExternalLink className="w-3.5 h-3.5" /> : <LinkIcon className="w-3.5 h-3.5" />}
                    Abrir Archivo
                  </a>

                  <button
                    type="button"
                    onClick={() => handleDelete(doc.id, doc.file_name)}
                    disabled={isDeleting}
                    title="Eliminar documento"
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                  >
                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin text-red-500" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-white border border-dashed border-gray-300 rounded-xl">
          <FileCheck className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <h3 className="text-base font-bold text-gray-900">No hay documentos registrados</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
            Adjunta contratos firmados, reportes de inspección o enlaces de DocuSign/Google Drive para tener todo organizado.
          </p>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-brand-gold text-brand-black font-semibold text-xs rounded-lg hover:bg-gold-hover transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Adjuntar Primer Documento
          </button>
        </div>
      )}

      {/* Attach Document Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100">
            <div className="p-6 pb-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Adjuntar Documento</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Registra un archivo o enlace a un documento de la transacción.
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDocument} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Nombre del Documento *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Contrato de Compraventa Ejecutado"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-brand-gold focus:border-brand-gold"
                />

                {/* Quick Presets */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {COMMON_DOC_PRESETS.slice(0, 4).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setFileName(preset)}
                      className="text-[11px] bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-0.5 rounded transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Enlace al Documento / URL *
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://drive.google.com/... o enlace de DocuSign/Dropbox"
                  value={filePath}
                  onChange={(e) => setFilePath(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-brand-gold focus:border-brand-gold font-mono text-xs"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Puedes pegar cualquier enlace de Google Drive, DocuSign, Dropbox o almacenamiento en la nube.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-brand-black bg-brand-gold hover:bg-gold-hover rounded-md shadow-xs"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Guardar Documento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
