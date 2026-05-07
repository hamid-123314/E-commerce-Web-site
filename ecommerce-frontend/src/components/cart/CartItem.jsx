// components/cart/CartItem.jsx
import { Minus, Plus, Trash2, ImageOff } from 'lucide-react'
import { formatPrice } from '@/lib/utils.js'
import { useUpdateCartItem, useRemoveCartItem } from '@/hooks/useCart.js'

export default function CartItem({ item }) {
  const update = useUpdateCartItem()
  const remove = useRemoveCartItem()
  const product = item.product

  return (
    <div className="flex gap-4 py-5 border-b border-ink-100 animate-fade-in">
      {/* Image */}
      <div className="w-20 h-24 bg-ink-50 flex-shrink-0 overflow-hidden">
        {product?.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-ink-200">
            <ImageOff size={20} />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 flex flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-medium text-ink-900 leading-snug">{product?.name}</h4>
          <button onClick={() => remove.mutate(item.productId)}
            disabled={remove.isPending}
            className="text-ink-300 hover:text-rose transition-colors p-1 flex-shrink-0">
            <Trash2 size={14} />
          </button>
        </div>

        <div className="flex items-center justify-between mt-3">
          {/* Quantity control */}
          <div className="flex items-center border border-ink-200">
            <button onClick={() => update.mutate({ productId: item.productId, quantity: item.quantity - 1 })}
              disabled={item.quantity <= 1 || update.isPending}
              className="p-2 text-ink-600 hover:bg-ink-50 disabled:opacity-30 transition-colors">
              <Minus size={12} />
            </button>
            <span className="w-8 text-center text-sm font-mono font-medium">{item.quantity}</span>
            <button onClick={() => update.mutate({ productId: item.productId, quantity: item.quantity + 1 })}
              disabled={update.isPending}
              className="p-2 text-ink-600 hover:bg-ink-50 disabled:opacity-30 transition-colors">
              <Plus size={12} />
            </button>
          </div>

          {/* Price */}
          <span className="font-display font-semibold text-ink-900">
            {formatPrice(Number(item.unitPrice) * item.quantity)}
          </span>
        </div>
      </div>
    </div>
  )
}
