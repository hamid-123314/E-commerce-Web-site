// pages/orders/OrdersPage.jsx
import { useOrders } from '@/hooks/useOrders.js'
import OrderCard from '@/components/order/OrderCard.jsx'
import { PageLoading, Empty } from '@/components/ui/index.jsx'
import { ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function OrdersPage() {
  const { data, isLoading } = useOrders()
  const orders = data?.orders ?? []

  return (
    <div className="page-container py-12 max-w-3xl">
      <div className="mb-10">
        <div className="font-mono text-xs text-ink-400 uppercase tracking-widest mb-2">History</div>
        <h1 className="section-title">My Orders</h1>
      </div>

      {isLoading ? <PageLoading /> : orders.length === 0 ? (
        <Empty icon={ShoppingBag} title="No orders yet"
          desc="When you place an order, it will appear here."
          action={<Link to="/products" className="btn-primary">Start Shopping</Link>} />
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map(order => <OrderCard key={order.id} order={order} />)}
        </div>
      )}
    </div>
  )
}
