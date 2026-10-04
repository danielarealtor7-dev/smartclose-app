'use client'

import { useState } from 'react'
import { 
  Users, 
  Phone, 
  Mail, 
  MessageCircle, 
  UserPlus, 
  Trash2, 
  Check, 
  AlertCircle, 
  Loader2, 
  Search,
  Building2,
  Briefcase
} from 'lucide-react'

import { updateTransactionContactRole, createContact } from '@/app/actions/contacts'
import { useRouter } from 'next/navigation'

interface ContactRecord {
  id: string
  first_name: string
  last_name: string
  role_type: string
  email?: string | null
  phone?: string | null
}

interface TransactionData {
  id: string
  property_address: string
  buyer_names?: string | null
  seller_names?: string | null
  buyer_agent_id?: string | null
  listing_agent_id?: string | null
  lender_id?: string | null
  inspector_id?: string | null
  title_company_id?: string | null
  escrow_agent_id?: string | null
  buyer_agent?: ContactRecord | null
  listing_agent?: ContactRecord | null
  lender?: ContactRecord | null
  inspector?: ContactRecord | null
  title_company?: ContactRecord | null
  escrow_agent?: ContactRecord | null
}

type RoleField = 
  | 'buyer_agent_id' 
  | 'listing_agent_id' 
  | 'lender_id' 
  | 'inspector_id' 
  | 'title_company_id' 
  | 'escrow_agent_id'

interface RoleConfig {
  field: RoleField
  title: string
  roleType: string
  description: string
  color: string
}

const ROLES_CONFIG: RoleConfig[] = [
  { field: 'buyer_agent_id', title: "Buyer's Agent", roleType: 'BUYER_AGENT', description: 'Representing buyer in purchase', color: 'blue' },
  { field: 'listing_agent_id', title: 'Listing Agent', roleType: 'LISTING_AGENT', description: 'Representing seller in listing', color: 'indigo' },
  { field: 'lender_id', title: 'Lender / Loan Officer', roleType: 'LENDER', description: 'Financing and loan processing', color: 'emerald' },
  { field: 'title_company_id', title: 'Title Company', roleType: 'TITLE', description: 'Title search and commitment', color: 'amber' },
  { field: 'escrow_agent_id', title: 'Escrow Officer', roleType: 'ESCROW', description: 'Escrow handling and settlement', color: 'purple' },
  { field: 'inspector_id', title: 'Property Inspector', roleType: 'INSPECTOR', description: 'Home, roof, pest or term inspector', color: 'teal' },
]

export function TransactionContactsClient({
  transaction,
  allContacts
}: {
  transaction: TransactionData
  allContacts: ContactRecord[]
}) {
  const router = useRouter()
  const [contacts, setContacts] = useState<ContactRecord[]>(allContacts)
  const [assigningRole, setAssigningRole] = useState<RoleConfig | null>(null)
  const [assignSearch, setAssignSearch] = useState('')
  const [loadingField, setLoadingField] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Quick contact creation inside modal
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newFirstName, setNewFirstName] = useState('')
  const [newLastName, setNewLastName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [creatingLoading, setCreatingLoading] = useState(false)

  const handleAssignContact = async (contactId: string | null) => {
    if (!assigningRole) return
    const field = assigningRole.field
    setLoadingField(field)
    setError(null)

    try {
      const res = await updateTransactionContactRole(transaction.id, field, contactId)
      if (res.error) {
        setError(res.error)
      } else {
        setSuccess('Contacto asignado exitosamente.')
        setAssigningRole(null)
        setShowCreateForm(false)
        router.refresh()
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch {
      setError('Error al actualizar el contacto.')
    } finally {
      setLoadingField(null)
    }
  }

  const handleCreateAndAssign = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!assigningRole || !newFirstName || !newLastName) return
    setCreatingLoading(true)
    setError(null)

    try {
      const res = await createContact({
        first_name: newFirstName.trim(),
        last_name: newLastName.trim(),
        role_type: assigningRole.roleType,
        email: newEmail.trim() || undefined,
        phone: newPhone.trim() || undefined
      })

      if (res.error) {
        setError(res.error)
      } else if (res.data) {
        setContacts(prev => [res.data, ...prev])
        await handleAssignContact(res.data.id)
      }
    } catch {
      setError('Error al crear el nuevo contacto.')
    } finally {
      setCreatingLoading(false)
    }
  }

  const filteredModalContacts = contacts.filter(c => {
    const fullName = `${c.first_name} ${c.last_name}`.toLowerCase()
    const email = (c.email || '').toLowerCase()
    const query = assignSearch.toLowerCase()
    return fullName.includes(query) || email.includes(query)
  })

  const getContactForRole = (field: RoleField): ContactRecord | null => {
    switch (field) {
      case 'buyer_agent_id': return transaction.buyer_agent || null
      case 'listing_agent_id': return transaction.listing_agent || null
      case 'lender_id': return transaction.lender || null
      case 'inspector_id': return transaction.inspector || null
      case 'title_company_id': return transaction.title_company || null
      case 'escrow_agent_id': return transaction.escrow_agent || null
      default: return null
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-brand-black flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-gold" />
            Contactos de la Transacción
          </h2>
          <p className="text-sm text-text-muted mt-1">
            Partes involucradas en la compraventa de <strong>{transaction.property_address}</strong>.
          </p>
        </div>
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

      {/* Principals Banner (Buyers & Sellers) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-amber-50 text-amber-700 rounded-lg border border-amber-200 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Comprador(es) / Principals</h4>
            <p className="text-base font-bold text-gray-900 mt-0.5">{transaction.buyer_names || 'No especificado'}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 shrink-0">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Vendedor(es) / Principals</h4>
            <p className="text-base font-bold text-gray-900 mt-0.5">{transaction.seller_names || 'No especificado'}</p>
          </div>
        </div>
      </div>

      {/* Grid of Key Professional Roles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {ROLES_CONFIG.map((role) => {
          const contact = getContactForRole(role.field)
          const isLoading = loadingField === role.field

          return (
            <div 
              key={role.field}
              className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden flex flex-col justify-between hover:border-gray-300 transition-colors"
            >
              <div className="p-5 pb-4">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md">
                    {role.title}
                  </span>
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                </div>

                {contact ? (
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-base font-bold text-gray-900">
                        {contact.first_name} {contact.last_name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">{role.description}</p>
                    </div>

                    <div className="space-y-1.5 text-xs text-gray-600">
                      {contact.email ? (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="truncate">{contact.email}</span>
                        </div>
                      ) : null}

                      {contact.phone ? (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>{contact.phone}</span>
                        </div>
                      ) : null}
                    </div>

                    {/* Quick communication actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                      {contact.phone ? (
                        <a
                          href={`tel:${contact.phone}`}
                          title="Llamar"
                          className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 transition-colors"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      ) : null}

                      {contact.phone ? (
                        <a
                          href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="WhatsApp"
                          className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      ) : null}

                      {contact.email ? (
                        <a
                          href={`mailto:${contact.email}`}
                          title="Enviar Correo"
                          className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors"
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => handleAssignContact(null)}
                        disabled={isLoading}
                        title="Desvincular rol"
                        className="ml-auto p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center">
                    <p className="text-xs text-gray-400 italic mb-3">No hay profesional asignado a este rol</p>
                    <button
                      type="button"
                      onClick={() => {
                        setAssigningRole(role)
                        setShowCreateForm(false)
                        setAssignSearch('')
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-brand-black text-white hover:bg-gray-800 rounded-lg transition-colors shadow-xs"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Asignar Contacto
                    </button>
                  </div>
                )}
              </div>

              {contact && (
                <div className="bg-gray-50/60 px-5 py-2.5 border-t border-gray-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setAssigningRole(role)
                      setShowCreateForm(false)
                      setAssignSearch('')
                    }}
                    className="text-xs font-semibold text-brand-gold hover:text-gold-hover hover:underline"
                  >
                    Cambiar Asignación
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Assignment Modal */}
      {assigningRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100">
            {/* Modal Header */}
            <div className="p-6 pb-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Asignar {assigningRole.title}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Selecciona un contacto existente o crea uno nuevo para esta posición.
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setAssigningRole(null)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {!showCreateForm ? (
                <div className="space-y-4">
                  {/* Search and New Contact Toggle */}
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Buscar por nombre o correo..."
                        value={assignSearch}
                        onChange={(e) => setAssignSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-gold"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(true)}
                      className="px-3 py-2 text-xs font-semibold text-brand-black bg-brand-gold hover:bg-gold-hover rounded-md shrink-0 flex items-center gap-1 shadow-xs"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Nuevo
                    </button>
                  </div>

                  {/* List of contacts */}
                  <div className="max-h-64 overflow-y-auto divide-y divide-gray-100 border border-gray-200 rounded-lg">
                    {filteredModalContacts.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleAssignContact(c.id)}
                        disabled={loadingField !== null}
                        className="w-full text-left p-3 hover:bg-gray-50 transition-colors flex items-center justify-between group"
                      >
                        <div>
                          <p className="text-sm font-semibold text-gray-900 group-hover:text-brand-gold transition-colors">
                            {c.first_name} {c.last_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {c.email || c.phone || 'Sin datos de contacto'}
                          </p>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">
                          {c.role_type}
                        </span>
                      </button>
                    ))}

                    {filteredModalContacts.length === 0 && (
                      <div className="p-6 text-center text-gray-500 text-xs">
                        No se encontraron contactos coincidentes.
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setAssigningRole(null)}
                      className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCreateAndAssign} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Nombre *</label>
                      <input
                        type="text"
                        required
                        value={newFirstName}
                        onChange={(e) => setNewFirstName(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-brand-gold focus:border-brand-gold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Apellido *</label>
                      <input
                        type="text"
                        required
                        value={newLastName}
                        onChange={(e) => setNewLastName(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-brand-gold focus:border-brand-gold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Correo Electrónico</label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="profesional@empresa.com"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-brand-gold focus:border-brand-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Teléfono</label>
                    <input
                      type="tel"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-brand-gold focus:border-brand-gold"
                    />
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="text-xs text-gray-500 hover:text-gray-700 underline"
                    >
                      ← Volver a lista existente
                    </button>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setAssigningRole(null)}
                        className="px-4 py-2 text-sm text-gray-700 border rounded-md hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={creatingLoading}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-brand-black bg-brand-gold hover:bg-gold-hover rounded-md shadow-xs"
                      >
                        {creatingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        Guardar y Asignar
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
