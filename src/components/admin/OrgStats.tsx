import { Users, Files, Contact2, Activity } from 'lucide-react'

type OrgStatsProps = {
  stats: {
    usersCount: number
    activeTransactions: number
    totalTransactions: number
    totalContacts: number
  }
}

export function OrgStats({ stats }: OrgStatsProps) {
  const statCards = [
    { name: 'Total Users', value: stats.usersCount, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Active Transactions', value: stats.activeTransactions, icon: Activity, color: 'text-green-600', bg: 'bg-green-100' },
    { name: 'Total Transactions', value: stats.totalTransactions, icon: Files, color: 'text-brand-gold', bg: 'bg-yellow-100' },
    { name: 'Total Contacts', value: stats.totalContacts, icon: Contact2, color: 'text-purple-600', bg: 'bg-purple-100' },
  ]

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Organization Overview</h2>
      <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((item) => (
          <div
            key={item.name}
            className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden border border-gray-100"
          >
            <dt>
              <div className={`absolute rounded-md p-3 ${item.bg}`}>
                <item.icon className={`h-6 w-6 ${item.color}`} aria-hidden="true" />
              </div>
              <p className="ml-16 text-sm font-medium text-gray-500 truncate">{item.name}</p>
            </dt>
            <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
