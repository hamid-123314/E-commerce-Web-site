// pages/cart/CheckoutSuccessPage.jsx
import { Link } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'

export default function CheckoutSuccessPage() {
  return (
    <div className="page-container py-24 text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-sage-light mb-8">
        <CheckCircle size={40} className="text-sage" />
      </div>
      <h1 className="section-title mb-4">Order Confirmed!</h1>
      <p className="text-ink-500 mb-10 max-w-md mx-auto">
        Thank you for your purchase. You'll receive a confirmation email shortly.
      </p>
      <div className="flex items-center justify-center gap-4">
        <Link to="/orders" className="btn-primary">View My Orders</Link>
        <Link to="/products" className="btn-secondary">Continue Shopping</Link>
      </div>
    </div>
  )
}
