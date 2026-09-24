'use client'

import { useState } from 'react'
import { updateUserRole } from '@/app/actions/admin'
import { ShieldCheck, User } from 'lucide-react'

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
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoadingId(null)
    }
  }

  const roleOptions = ['SUPER_ADMIN', 'ADMIN', 'AGENT', 'ASSISTANT']

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Users</h2>
          <p className="mt-1 text-sm text-gray-500">
            A list of all users in your organization including their name, role and email.
          </p>
        </div>
        {/* Placeholder for future add user functionality */}
        <div className="mt-4 sm:mt-0">
          <button className="bg-brand-black text-white px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-800 transition-colors">
            Invite User
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 text-sm text-red-700 bg-red-50 rounded-md">
          {error}
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
