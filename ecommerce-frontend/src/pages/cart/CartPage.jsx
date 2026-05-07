// pages/cart/CartPage.jsx
import { Link } from 'react-router-dom'
import { ShoppingBag, ArrowLeft } from 'lucide-react'
import { useCart, useCheckout } from '@/hooks/useCart.js'
import CartItem from '@/components/cart/CartItem.jsx'
import { formatPrice } from '@/lib/utils.js'
import { PageLoading, Button, Empty } from '@/components/ui/index.jsx'
import { useAuthStore } from '@/store/auth.store.js'

export default function CartPage() {
  const { data: cart, isLoading } = useCart()
  const checkout = useCheckout()
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const items = cart?.items ?? []

  const handleCheckout = () => {
    checkout.mutate(items.map(i => ({ productId: i.productId, quantity: i.quantity })))
  }

  if (isLoading) return <PageLoading />

  return (
    <div className="page-container py-12">
      <Link to="/products" className="inline-flex items-center gap-2 text-sm text-ink-400 hover:text-ink-900 mb-10 transition-colors">
        <ArrowLeft size={14} /> Continue shopping
      </Link>

      <h1 className="section-title mb-10">Your Cart</h1>

      {items.length === 0 ? (
        <Empty icon={ShoppingBag} title="Your cart is empty"
          desc="Add some products to get started."
          action={<Link to="/products" className="btn-primary">Browse Collection</Link>} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Items */}
          <div className="lg:col-span-2">
            {items.map(item => <CartItem key={item.productId} item={item} />)}
          </div>

          {/* Summary */}
          <div>
            <div className="card p-6 sticky top-24">
              <h2 className="font-display text-xl font-semibold mb-6">Order Summary</h2>

              <div className="flex justify-between text-sm text-ink-600 mb-3">
                <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span>{formatPrice(cart?.total ?? 0)}</span>
              </div>
              <div className="flex justify-between text-sm text-ink-600 mb-6">
                <span>Shipping</span>
                <span className="text-sage">Free</span>
              </div>
              <div className="divider mb-6" />
              <div className="flex justify-between font-display font-semibold text-lg text-ink-900 mb-8">
                <span>Total</span>
                <span>{formatPrice(cart?.total ?? 0)}</span>
              </div>

              {isAuthenticated ? (
                <Button onClick={handleCheckout} loading={checkout.isPending} className="w-full py-4 justify-center">
                  Proceed to Checkout
                </Button>
              ) : (
                <div className="space-y-3">
                  <Link to="/login" className="btn-primary w-full justify-center flex py-4">
                    Sign in to Checkout
                  </Link>
                  <p className="text-xs text-center text-ink-400">
                    Don't have an account? <Link to="/register" className="underline hover:text-ink-900">Register</Link>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
