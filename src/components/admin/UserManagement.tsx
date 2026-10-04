'use client'

import { useState, useMemo } from 'react'
import { updateUserRole, deleteUserFromOrg, inviteUser, generateWhatsAppInvite } from '@/app/actions/admin'
import { 
  User, 
  UserPlus, 
  Trash2, 
  Search, 
  Mail, 
  MessageCircle, 
  Copy, 
  Check, 
  AlertCircle, 
  Loader2, 
  ShieldCheck, 
  ExternalLink 
} from 'lucide-react'

type UserData = {
  id: string
  email: string
  role: string
  created_at: string
  auth_id?: string
}

interface UserManagementProps {
  initialUsers: UserData[]
  currentUserId?: string
  currentUserRole?: string
}

export function UserManagement({ initialUsers, currentUserId, currentUserRole }: UserManagementProps) {
  const [users, setUsers] = useState<UserData[]>(initialUsers)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null)

  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Invite modal state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [inviteTab, setInviteTab] = useState<'email' | 'whatsapp'>('email')
  const [inviteEmail, setInviteEmail] = useState('')
  const [invitePhone, setInvitePhone] = useState('')
  const [inviteRole, setInviteRole] = useState('AGENT')
  const [inviteLoading, setInviteLoading] = useState(false)
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)
  const [hasCopiedLink, setHasCopiedLink] = useState(false)

  const roleOptions = useMemo(() => {
    if (currentUserRole === 'SUPER_ADMIN') {
      return ['SUPER_ADMIN', 'ADMIN', 'AGENT', 'ASSISTANT']
    }
    return ['ADMIN', 'AGENT', 'ASSISTANT']
  }, [currentUserRole])

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = u.email.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter
      return matchesSearch && matchesRole
    })
  }, [users, searchQuery, roleFilter])

  const handleRoleChange = async (userId: string, newRole: string) => {
    setLoadingId(userId)
    setError(null)
    setSuccessMessage(null)

    try {
      const result = await updateUserRole(userId, newRole)
      if (result.error) {
        setError(result.error)
      } else {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
        setSuccessMessage('Rol de usuario actualizado correctamente.')
        setTimeout(() => setSuccessMessage(null), 4000)
      }
    } catch {
      setError('Ocurrió un error inesperado al actualizar el rol.')
    } finally {
      setLoadingId(null)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return
    const userId = userToDelete.id
    setDeletingId(userId)
    setError(null)
    setSuccessMessage(null)

    try {
      const result = await deleteUserFromOrg(userId)
      if (result.error) {
        setError(result.error)
      } else {
        setUsers(prev => prev.filter(u => u.id !== userId))
        setSuccessMessage(`Usuario ${userToDelete.email} eliminado exitosamente.`)
        setTimeout(() => setSuccessMessage(null), 4000)
      }
    } catch {
      setError('Ocurrió un error inesperado al eliminar el usuario.')
    } finally {
      setDeletingId(null)
      setUserToDelete(null)
    }
  }

  const handleSendEmailInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail) return
    setInviteLoading(true)
    setError(null)

    try {
      const res = await inviteUser(inviteEmail.trim().toLowerCase(), inviteRole)
      if (res.error) {
        setError(res.error)
      } else {
        setSuccessMessage(`Invitación por correo enviada a ${inviteEmail}.`)
        setIsInviteModalOpen(false)
        setInviteEmail('')
        // Optimistically add to users list if not already present
        if (!users.some(u => u.email.toLowerCase() === inviteEmail.toLowerCase())) {
          setUsers(prev => [
            {
              id: 'pending-' + Date.now(),
              email: inviteEmail.trim().toLowerCase(),
              role: inviteRole,
              created_at: new Date().toISOString()
            },
            ...prev
          ])
        }
        setTimeout(() => setSuccessMessage(null), 5000)
      }
    } catch {
      setError('Error al enviar la invitación por correo.')
    } finally {
      setInviteLoading(false)
    }
  }

  const handleGenerateWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail) return
    setInviteLoading(true)
    setError(null)

    try {
      const res = await generateWhatsAppInvite(inviteEmail.trim().toLowerCase(), inviteRole)
      if (res.error) {
        setError(res.error)
      } else if (res.link) {
        setGeneratedLink(res.link)
        // Add to users list if not already present
        if (!users.some(u => u.email.toLowerCase() === inviteEmail.toLowerCase())) {
          setUsers(prev => [
            {
              id: 'pending-' + Date.now(),
              email: inviteEmail.trim().toLowerCase(),
              role: inviteRole,
              created_at: new Date().toISOString()
            },
            ...prev
          ])
        }
      }
    } catch {
      setError('Error al generar enlace de WhatsApp.')
    } finally {
      setInviteLoading(false)
    }
  }

  const handleCopyLink = () => {
    if (!generatedLink) return
    navigator.clipboard.writeText(generatedLink)
    setHasCopiedLink(true)
    setTimeout(() => setHasCopiedLink(false), 3000)
  }

  const handleOpenWhatsApp = () => {
    if (!generatedLink) return
    const message = `¡Hola! Te invito a unirte a mi equipo en SmartClose. Aquí tienes tu enlace de acceso seguro:\n\n${generatedLink}\n\nHaz clic en el enlace para establecer tu contraseña y acceder al sistema.`
    const cleanPhone = invitePhone.replace(/[^0-9]/g, '')
    const waUrl = cleanPhone 
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(waUrl, '_blank')
  }

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'ADMIN':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'AGENT':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'ASSISTANT':
        return 'bg-amber-100 text-amber-800 border-amber-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand-gold" />
            Gestión de Usuarios y Accesos
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Administra los roles, invitaciones y permisos de los miembros de tu organización.
          </p>
        </div>
        <div>
          <button 
            type="button"
            onClick={() => {
              setError(null)
              setGeneratedLink(null)
              setIsInviteModalOpen(true)
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand-black text-white px-4 py-2.5 text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            Invitar Usuario
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="flex items-start gap-3 p-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">{error}</div>
          <button 
            onClick={() => setError(null)} 
            className="text-red-500 hover:text-red-700 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {successMessage && (
        <div className="flex items-start gap-3 p-4 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg">
          <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">{successMessage}</div>
          <button 
            onClick={() => setSuccessMessage(null)} 
            className="text-emerald-500 hover:text-emerald-700 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por email o usuario..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-medium text-gray-600 shrink-0">Filtrar por Rol:</label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold"
          >
            <option value="ALL">Todos los roles ({users.length})</option>
            {roleOptions.map(role => (
              <option key={role} value={role}>{role.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Rol Asignado
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Fecha Registro
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => {
              const isCurrentUser = user.id === currentUserId
              const isDeletingThis = deletingId === user.id

              return (
                <tr key={user.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200 text-gray-600 font-bold">
                        {user.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                          {user.email.split('@')[0]}
                          {isCurrentUser && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-900 border border-amber-200">
                              Tú
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        disabled={loadingId === user.id || isCurrentUser}
                        title={isCurrentUser ? "No puedes cambiar tu propio rol desde aquí" : "Modificar rol de usuario"}
                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-md border focus:outline-none focus:ring-1 focus:ring-brand-gold ${getRoleBadgeClass(user.role)} ${isCurrentUser ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer hover:opacity-90'}`}
                      >
                        {roleOptions.map((role) => (
                          <option key={role} value={role}>
                            {role.replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                      {loadingId === user.id && (
                        <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    }) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {isCurrentUser ? (
                      <span className="text-xs text-gray-400 italic">Cuenta activa</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setUserToDelete(user)}
                        disabled={isDeletingThis}
                        title="Eliminar usuario de la organización"
                        className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        {isDeletingThis ? (
                          <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  <User className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                  <p className="font-medium text-gray-900">No se encontraron usuarios</p>
                  <p className="text-sm mt-1">Prueba cambiando los filtros de búsqueda o invita un nuevo miembro.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 border border-gray-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">¿Eliminar Usuario?</h3>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              ¿Estás seguro de que deseas remover a <strong>{userToDelete.email}</strong> de la organización?
            </p>
            <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-md mb-6 border border-red-100">
              Esta acción revocará inmediatamente sus accesos a todas las transacciones, contactos y configuraciones de esta empresa.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                disabled={deletingId !== null}
                className="px-4 py-2 text-sm text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deletingId !== null}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors shadow-sm"
              >
                {deletingId ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Sí, Eliminar Usuario
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-6 pb-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-brand-gold" />
                  Invitar a Nuevo Miembro
                </h3>
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-lg font-bold"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Selecciona cómo deseas enviar la invitación para que el usuario acceda a la plataforma.
              </p>

              {/* Tabs */}
              <div className="flex border-b border-gray-200 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setInviteTab('email')
                    setGeneratedLink(null)
                  }}
                  className={`flex items-center gap-2 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                    inviteTab === 'email'
                      ? 'border-brand-gold text-brand-black font-semibold'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  Por Correo Electrónico
                </button>
                <button
                  type="button"
                  onClick={() => setInviteTab('whatsapp')}
                  className={`flex items-center gap-2 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                    inviteTab === 'whatsapp'
                      ? 'border-emerald-500 text-emerald-700 font-semibold'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  WhatsApp / Enlace Directo
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {inviteTab === 'email' ? (
                <form onSubmit={handleSendEmailInvite} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Correo Electrónico *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="ejemplo@inmobiliaria.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-brand-gold focus:border-brand-gold"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Se enviará un correo automático de bienvenida con su enlace seguro de acceso.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Rol Asignado *
                    </label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-brand-gold focus:border-brand-gold"
                    >
                      {roleOptions.map((role) => (
                        <option key={role} value={role}>
                          {role.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-6 flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsInviteModalOpen(false)}
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 border rounded-md"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={inviteLoading}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm text-white bg-brand-black hover:bg-gray-800 rounded-md font-semibold transition-colors shadow-sm"
                    >
                      {inviteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                      Enviar Invitación
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  {!generatedLink ? (
                    <form onSubmit={handleGenerateWhatsApp} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                          Correo Electrónico (Para el login) *
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="agente@smartclosetc.com"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                          Número de WhatsApp (Opcional)
                        </label>
                        <input
                          type="tel"
                          placeholder="+1 (555) 000-0000"
                          value={invitePhone}
                          onChange={(e) => setInvitePhone(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          Si agregas el número, podrás abrir un chat directo con el mensaje listo.
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                          Rol Asignado *
                        </label>
                        <select
                          value={inviteRole}
                          onChange={(e) => setInviteRole(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                        >
                          {roleOptions.map((role) => (
                            <option key={role} value={role}>
                              {role.replace('_', ' ')}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="mt-6 flex justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsInviteModalOpen(false)}
                          className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 border rounded-md"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={inviteLoading}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm text-white bg-emerald-600 hover:bg-emerald-700 rounded-md font-semibold transition-colors shadow-sm"
                        >
                          {inviteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
                          Generar Enlace
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <h4 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600" />
                          ¡Enlace de Invitación Generado!
                        </h4>
                        <p className="text-xs text-emerald-700 mt-1">
                          Este enlace es único y seguro para <strong>{inviteEmail}</strong> ({inviteRole}).
                        </p>
                        
                        <div className="mt-3 flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={generatedLink}
                            className="w-full text-xs font-mono bg-white border border-emerald-300 rounded p-2 text-gray-700 select-all"
                          />
                          <button
                            type="button"
                            onClick={handleCopyLink}
                            className="shrink-0 p-2 text-xs font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded flex items-center gap-1 transition-colors"
                          >
                            {hasCopiedLink ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
                            {hasCopiedLink ? 'Copiado' : 'Copiar'}
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button
                          type="button"
                          onClick={handleOpenWhatsApp}
                          className="flex-1 inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Abrir en WhatsApp Web
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsInviteModalOpen(false)
                            setGeneratedLink(null)
                            setInviteEmail('')
                            setInvitePhone('')
                          }}
                          className="px-4 py-2.5 text-sm text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg font-medium transition-colors"
                        >
                          Listo
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

