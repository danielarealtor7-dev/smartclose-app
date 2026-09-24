import { getUsers, getOrgStats } from '@/app/actions/admin'
import { UserManagement } from '@/components/admin/UserManagement'
import { OrgStats } from '@/components/admin/OrgStats'
import { ShieldAlert } from 'lucide-react'

export default async function AdminPage() {
  const [usersRes, stats] = await Promise.all([
    getUsers(),
    getOrgStats()
  ])

  const { users, error } = usersRes

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-red-500 bg-red-50 rounded-lg">
        <ShieldAlert className="w-12 h-12 mb-4" />
        <h2 className="text-lg font-bold">Failed to load users</h2>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-500 mt-1">
          Manage user roles, permissions, and organization access.
        </p>
      </div>

      <OrgStats stats={stats} />

      <div className="bg-white shadow rounded-lg border border-gray-200 p-6">
        <UserManagement initialUsers={users || []} />
      </div>
    </div>
  )
}
