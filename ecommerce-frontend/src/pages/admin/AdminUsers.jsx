// pages/admin/AdminUsers.jsx
import { useQuery } from '@tanstack/react-query'
import { adminService } from '@/lib/services.js'
import { PageLoading } from '@/components/ui/index.jsx'
import { formatDate } from '@/lib/utils.js'

export default function AdminUsers() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => adminService.getUsers({ limit: 50 }),
  })
  const users = data?.users ?? []

  if (isLoading) return <PageLoading />

  return (
    <div>
      <div className="mb-8">
        <div className="font-mono text-xs text-ink-400 uppercase tracking-widest mb-1">Manage</div>
        <h1 className="font-display text-2xl font-semibold text-ink-900">Users</h1>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-100">
              {['Name', 'Email', 'Role', 'Orders', 'Joined'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-medium text-ink-400 uppercase tracking-wider font-mono">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-50">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-ink-50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-ink-900 text-white flex items-center justify-center text-xs font-display flex-shrink-0">
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                    <span className="font-medium text-ink-900">{user.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-ink-500">{user.email}</td>
                <td className="px-5 py-4">
                  <span className={`badge text-[10px] ${user.role === 'admin' ? 'bg-amber-light text-amber-dark' : 'bg-ink-100 text-ink-500'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-5 py-4 font-mono text-ink-700">{user._count?.orders ?? 0}</td>
                <td className="px-5 py-4 text-ink-400 text-xs">{formatDate(user.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
