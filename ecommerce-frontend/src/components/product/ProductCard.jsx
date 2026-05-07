// components/product/ProductCard.jsx
import { Link } from 'react-router-dom'
import { ShoppingBag, ImageOff } from 'lucide-react'
import { formatPrice } from '@/lib/utils.js'
import { useAddToCart } from '@/hooks/useCart.js'

export default function ProductCard({ product }) {
  const addToCart = useAddToCart()

  return (
    <div className="group card overflow-hidden animate-scale-in">
      {/* Image */}
      <Link to={`/products/${product.id}`} className="block relative aspect-[3/4] overflow-hidden bg-ink-50">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-ink-200">
            <ImageOff size={32} />
          </div>
        )}
        {product.stock <= 5 && product.stock > 0 && (
          <span className="absolute top-3 left-3 badge bg-amber-light text-amber-dark text-[10px]">
            Only {product.stock} left
          </span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="badge bg-ink-100 text-ink-500 text-xs">Out of stock</span>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="p-4">
        <div className="text-[10px] text-ink-400 uppercase tracking-widest mb-1 font-mono">
          {product.category?.name}
        </div>
        <Link to={`/products/${product.id}`}>
          <h3 className="font-medium text-ink-900 text-sm leading-snug hover:text-amber-dark transition-colors mb-2 line-clamp-2">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center justify-between mt-3">
          <span className="font-display text-base font-semibold text-ink-900">
            {formatPrice(product.price)}
          </span>
          <button
            onClick={() => addToCart.mutate({ productId: product.id, quantity: 1, product })}
            disabled={product.stock === 0 || addToCart.isPending}
            className="p-2 border border-ink-900 text-ink-900 hover:bg-ink-900 hover:text-white
              transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95">
            <ShoppingBag size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}
