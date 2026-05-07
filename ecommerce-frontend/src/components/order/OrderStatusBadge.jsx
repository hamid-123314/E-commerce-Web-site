// components/order/OrderStatusBadge.jsx
import { cn, orderStatusColor, orderStatusLabel } from '@/lib/utils.js'

export default function OrderStatusBadge({ status, className }) {
  return (
    <span className={cn('badge text-[10px] px-2.5 py-1', orderStatusColor(status), className)}>
      {orderStatusLabel(status)}
    </span>
  )
}
