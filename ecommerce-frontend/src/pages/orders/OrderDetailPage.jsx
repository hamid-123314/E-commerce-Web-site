// pages/orders/OrderDetailPage.jsx
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ImageOff } from 'lucide-react'
import { useOrder, useCancelOrder } from '@/hooks/useOrders.js'
import OrderStatusBadge from '@/components/order/OrderStatusBadge.jsx'
import { PageLoading, Card, Button } from '@/components/ui/index.jsx'
import { formatDate, formatPrice, shortId } from '@/lib/utils.js'

export default function OrderDetailPage() {
  const { id } = useParams()
  const { data: order, isLoading } = useOrder(id)
  const cancel = useCancelOrder()

  if (isLoading) return <PageLoading />
  if (!order) return <div className="page-container py-20 text-center text-ink-400">Order not found</div>

  const canCancel = ['pending', 'paid'].includes(order.status)

  return (
    <div className="page-container py-12 max-w-3xl">
      <Link to="/orders" className="inline-flex items-center gap-2 text-sm text-ink-400 hover:text-ink-900 mb-10 transition-colors">
        <ArrowLeft size={14} /> Back to orders
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="font-mono text-xs text-ink-400 uppercase tracking-widest mb-1">Order</div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">#{shortId(order.id)}</h1>
          <div className="text-sm text-ink-400 mt-1">{formatDate(order.createdAt)}</div>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Items */}
      <Card className="mb-6">
        <h2 className="font-display text-lg font-semibold mb-5">Items</h2>
        <div className="divide-y divide-ink-100">
          {order.items?.map(item => (
            <div key={item.id} className="flex items-center gap-4 py-4">
              <div className="w-14 h-16 bg-ink-50 flex-shrink-0 overflow-hidden">
                {item.product?.imageUrl ? (
                  <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-ink-200">
                    <ImageOff size={16} />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-ink-900">{item.product?.name}</div>
                <div className="text-xs text-ink-400 font-mono mt-0.5">Qty: {item.quantity}</div>
              </div>
              <div className="font-display font-semibold text-ink-900">
                {formatPrice(Number(item.unitPrice) * item.quantity)}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-ink-100 pt-4 flex justify-between">
          <span className="font-medium">Total</span>
          <span className="font-display font-semibold text-lg">{formatPrice(order.total)}</span>
        </div>
      </Card>

      {canCancel && (
        <Button variant="danger" onClick={() => cancel.mutate(order.id)} loading={cancel.isPending}>
          Cancel Order
        </Button>
      )}
    </div>
  )
}
