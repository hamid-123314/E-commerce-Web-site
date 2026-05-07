// pages/admin/AdminDashboard.jsx
import { useQuery } from '@tanstack/react-query'
import { adminService } from '@/lib/services.js'
import { formatPrice, formatDate } from '@/lib/utils.js'
import { PageLoading, Card } from '@/components/ui/index.jsx'
import OrderStatusBadge from '@/components/order/OrderStatusBadge.jsx'
import { ShoppingBag, Users, Package, TrendingUp } from 'lucide-react'

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: adminService.getStats,
  })

  if (isLoading) return <PageLoading />

  const metrics = [
    { label: 'Total Revenue',  value: formatPrice(stats?.totalRevenue ?? 0), icon: TrendingUp, color: 'text-sage' },
    { label: 'Total Orders',   value: stats?.totalOrders ?? 0,  icon: ShoppingBag, color: 'text-amber-dark' },
    { label: 'Total Users',    value: stats?.totalUsers ?? 0,   icon: Users, color: 'text-blue-600' },
    { label: 'Total Products', value: stats?.totalProducts ?? 0, icon: Package, color: 'text-ink-600' },
  ]

  return (
    <div>
      <div className="mb-8">
        <div className="font-mono text-xs text-ink-400 uppercase tracking-widest mb-1">Overview</div>
        <h1 className="font-display text-2xl font-semibold text-ink-900">Dashboard</h1>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <Icon size={20} className={`${color} mb-3`} />
            <div className="font-display text-2xl font-semibold text-ink-900 mb-1">{value}</div>
            <div className="text-xs text-ink-400 uppercase tracking-wider font-mono">{label}</div>
          </Card>
        ))}
      </div>

      {/* Recent orders */}
      <Card>
        <h2 className="font-display text-lg font-semibold mb-5">Recent Orders</h2>
        <div className="divide-y divide-ink-100">
          {stats?.recentOrders?.map(order => (
            <div key={order.id} className="flex items-center justify-between py-3">
              <div>
                <div className="text-sm font-medium text-ink-900">{order.user?.name}</div>
                <div className="text-xs text-ink-400 font-mono mt-0.5">{formatDate(order.createdAt)}</div>
              </div>
              <div className="flex items-center gap-4">
                <OrderStatusBadge status={order.status} />
                <span className="font-display font-semibold text-sm">{formatPrice(order.total)}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
