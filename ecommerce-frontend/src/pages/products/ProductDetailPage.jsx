// pages/products/ProductDetailPage.jsx
import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShoppingBag, ArrowLeft, ImageOff, Minus, Plus } from 'lucide-react'
import { useProduct } from '@/hooks/useProducts.js'
import { useAddToCart } from '@/hooks/useCart.js'
import { formatPrice } from '@/lib/utils.js'
import { PageLoading, Button } from '@/components/ui/index.jsx'

export default function ProductDetailPage() {
  const { id } = useParams()
  const [qty, setQty] = useState(1)
  const { data: product, isLoading } = useProduct(id)
  const addToCart = useAddToCart()

  if (isLoading) return <PageLoading />
  if (!product) return <div className="page-container py-20 text-center text-ink-400">Product not found</div>

  const inStock = product.stock > 0
  const lowStock = product.stock > 0 && product.stock <= 5

  return (
    <div className="page-container py-12">
      <Link to="/products" className="inline-flex items-center gap-2 text-sm text-ink-400 hover:text-ink-900 mb-10 transition-colors">
        <ArrowLeft size={14} /> Back to collection
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
        {/* Image */}
        <div className="aspect-[3/4] bg-ink-50 overflow-hidden">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover animate-fade-in" />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-ink-200">
              <ImageOff size={48} />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col justify-center animate-slide-up">
          <div className="font-mono text-xs text-ink-400 uppercase tracking-widest mb-3">
            {product.category?.name}
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 mb-4">
            {product.name}
          </h1>

          {product.description && (
            <p className="text-ink-500 leading-relaxed mb-6 text-sm">{product.description}</p>
          )}

          <div className="font-display text-3xl font-semibold text-ink-900 mb-6">
            {formatPrice(product.price)}
          </div>

          {/* Stock */}
          <div className="mb-6">
            {!inStock && <span className="badge bg-ink-100 text-ink-500 text-xs">Out of stock</span>}
            {lowStock && <span className="badge bg-amber-light text-amber-dark text-xs">Only {product.stock} left</span>}
          </div>

          {/* Quantity */}
          {inStock && (
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-ink-200">
                <button onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="p-3 text-ink-600 hover:bg-ink-50 transition-colors disabled:opacity-30" disabled={qty <= 1}>
                  <Minus size={14} />
                </button>
                <span className="w-10 text-center font-mono font-medium">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                  className="p-3 text-ink-600 hover:bg-ink-50 transition-colors disabled:opacity-30" disabled={qty >= product.stock}>
                  <Plus size={14} />
                </button>
              </div>
            </div>
          )}

          <Button
            onClick={() => addToCart.mutate({ productId: product.id, quantity: qty, product })}
            disabled={!inStock}
            loading={addToCart.isPending}
            className="gap-3 py-4">
            <ShoppingBag size={16} />
            {inStock ? 'Add to Cart' : 'Out of Stock'}
          </Button>
        </div>
      </div>
    </div>
  )
}
