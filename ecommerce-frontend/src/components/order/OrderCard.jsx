// components/order/OrderCard.jsx
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { formatDate, formatPrice, shortId } from '@/lib/utils.js'
import OrderStatusBadge from './OrderStatusBadge.jsx'

export default function OrderCard({ order }) {
  return (
    <Link to={`/orders/${order.id}`}
      className="card p-5 flex items-center justify-between gap-4 hover:border-ink-300 transition-colors group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-2">
          <span className="font-mono text-sm font-medium text-ink-900">#{shortId(order.id)}</span>
          <OrderStatusBadge status={order.status} />
        </div>
        <div className="text-xs text-ink-400">{formatDate(order.createdAt)}</div>
        <div className="text-xs text-ink-400 mt-0.5">
          {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="font-display font-semibold text-ink-900">{formatPrice(order.total)}</span>
        <ChevronRight size={16} className="text-ink-300 group-hover:text-ink-600 transition-colors" />
      </div>
    </Link>
  )
}
