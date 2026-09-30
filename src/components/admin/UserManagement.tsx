'use client'

import { useState } from 'react'
import { updateUserRole } from '@/app/actions/admin'
import { User } from 'lucide-react'

type UserData = {
  id: string
  email: string
  role: string
  created_at: string
}

export function UserManagement({ initialUsers }: { initialUsers: UserData[] }) {
  const [users, setUsers] = useState<UserData[]>(initialUsers)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleRoleChange = async (userId: string, newRole: string) => {
    setLoadingId(userId)
    setError(null)
    
    try {
      const result = await updateUserRole(userId, newRole)
      if (result.error) {
        setError(result.error)
      } else {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
      }
    } catch (err) { // eslint-disable-line @typescript-eslint/no-unused-vars
      setError('An unexpected error occurred')
    } finally {
      setLoadingId(null)
    }
  }

  const roleOptions = ['SUPER_ADMIN', 'ADMIN', 'AGENT', 'ASSISTANT']

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Users</h2>
          <p className="mt-1 text-sm text-gray-500">
            A list of all users in your organization including their name, role and email.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button 
            onClick={() => setIsInviteModalOpen(true)}
            className="bg-brand-black text-white px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
          >
            Invite User
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 text-sm text-red-700 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Invite New User</h3>
            <form onSubmit={async (e) => {
              e.preventDefault()
              setError(null)
              const form = e.currentTarget
              const email = (form.elements.namedItem('email') as HTMLInputElement).value
              const role = (form.elements.namedItem('role') as HTMLSelectElement).value
              
              const { inviteUser } = await import('@/app/actions/admin')
              const res = await inviteUser(email, role)
              
              if (res.success) {
                alert('User invitation sent successfully!')
                setIsInviteModalOpen(false)
              } else {
                alert(`Error: ${res.error}`)
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input type="email" name="email" required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-gold focus:border-brand-gold" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select name="role" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-gold focus:border-brand-gold">
                    <option value="AGENT">AGENT</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="ASSISTANT">ASSISTANT</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setIsInviteModalOpen(false)} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 border rounded-md">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm text-brand-black bg-brand-gold hover:bg-gold-hover rounded-md font-medium">Send Invite</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-500" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.email.split('@')[0]}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      disabled={loadingId === user.id}
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-gold focus:border-brand-gold sm:text-sm rounded-md"
                    >
                      {roleOptions.map((role) => (
                        <option key={role} value={role}>
                          {role.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                    {loadingId === user.id && (
                      <span className="text-sm text-gray-500 animate-pulse">Saving...</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                  No users found in this organization.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
