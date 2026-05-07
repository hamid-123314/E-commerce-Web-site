// pages/admin/AdminOrders.jsx
import { useAdminOrders, useUpdateOrderStatus, useRefundOrder } from '@/hooks/useOrders.js'
import OrderStatusBadge from '@/components/order/OrderStatusBadge.jsx'
import { PageLoading } from '@/components/ui/index.jsx'
import { formatDate, formatPrice, shortId } from '@/lib/utils.js'

const STATUS_TRANSITIONS = {
  pending: ['paid', 'cancelled'],
  paid:    ['shipped', 'cancelled'],
  shipped: ['delivered'],
}

export default function AdminOrders() {
  const { data, isLoading } = useAdminOrders({ limit: 50 })
  const updateStatus = useUpdateOrderStatus()
  const refund = useRefundOrder()
  const orders = data?.orders ?? []

  if (isLoading) return <PageLoading />

  return (
    <div>
      <div className="mb-8">
        <div className="font-mono text-xs text-ink-400 uppercase tracking-widest mb-1">Manage</div>
        <h1 className="font-display text-2xl font-semibold text-ink-900">Orders</h1>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-100">
              {['Order', 'Customer', 'Date', 'Total', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-medium text-ink-400 uppercase tracking-wider font-mono">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-50">
            {orders.map(order => (
              <tr key={order.id} className="hover:bg-ink-50 transition-colors">
                <td className="px-5 py-4 font-mono font-medium">#{shortId(order.id)}</td>
                <td className="px-5 py-4">
                  <div className="text-ink-900">{order.user?.name}</div>
                  <div className="text-xs text-ink-400">{order.user?.email}</div>
                </td>
                <td className="px-5 py-4 text-ink-500 text-xs">{formatDate(order.createdAt)}</td>
                <td className="px-5 py-4 font-mono font-medium">{formatPrice(order.total)}</td>
                <td className="px-5 py-4"><OrderStatusBadge status={order.status} /></td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    {STATUS_TRANSITIONS[order.status]?.map(status => (
                      <button key={status}
                        onClick={() => updateStatus.mutate({ id: order.id, status })}
                        className="text-xs px-2 py-1 border border-ink-200 hover:bg-ink-900 hover:text-white hover:border-ink-900 transition-all font-mono">
                        → {status}
                      </button>
                    ))}
                    {order.status === 'paid' && (
                      <button onClick={() => refund.mutate(order.id)}
                        className="text-xs px-2 py-1 border border-rose text-rose hover:bg-rose hover:text-white transition-all font-mono">
                        Refund
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
