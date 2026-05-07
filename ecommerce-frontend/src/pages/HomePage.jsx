// pages/HomePage.jsx
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useProducts } from '@/hooks/useProducts.js'
import ProductCard from '@/components/product/ProductCard.jsx'
import { PageLoading } from '@/components/ui/index.jsx'

export default function HomePage() {
  const { data, isLoading } = useProducts({ limit: 4, sort: 'createdAt', order: 'desc' })
  const products = data?.products ?? []

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-ink-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/2 w-96 h-96 bg-amber rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="page-container relative py-28 md:py-40">
          <div className="max-w-2xl animate-slide-up">
            <div className="font-mono text-xs text-amber uppercase tracking-widest mb-6">New Collection</div>
            <h1 className="font-display text-5xl md:text-7xl font-semibold leading-tight mb-6">
              Style that<br /><em>endures.</em>
            </h1>
            <p className="text-ink-300 text-lg leading-relaxed mb-10 max-w-md">
              Thoughtfully crafted pieces designed to last. Quality over quantity, always.
            </p>
            <div className="flex items-center gap-4">
              <Link to="/products" className="btn-primary bg-amber hover:bg-amber-dark border-0 px-8 py-4 text-sm">
                Shop Collection
              </Link>
              <Link to="/products" className="flex items-center gap-2 text-sm text-ink-300 hover:text-white transition-colors">
                Explore all <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Latest products */}
      <section className="page-container py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="font-mono text-xs text-ink-400 uppercase tracking-widest mb-2">Just arrived</div>
            <h2 className="section-title">Latest Arrivals</h2>
          </div>
          <Link to="/products" className="flex items-center gap-2 text-sm text-ink-600 hover:text-ink-900 transition-colors">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {isLoading ? <PageLoading /> : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* Banner */}
      <section className="bg-ink-100 py-16">
        <div className="page-container text-center">
          <div className="font-mono text-xs text-ink-400 uppercase tracking-widest mb-3">Our Promise</div>
          <h2 className="section-title mb-4">Free shipping on orders over 500 MAD</h2>
          <p className="text-ink-500 text-sm mb-8">Delivered within 3-5 business days across Morocco</p>
          <Link to="/products" className="btn-primary">Shop Now</Link>
        </div>
      </section>
    </div>
  )
}
