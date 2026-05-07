// pages/products/ProductsPage.jsx
import { useState } from 'react'
import { useProducts } from '@/hooks/useProducts.js'
import ProductCard from '@/components/product/ProductCard.jsx'
import ProductFilters from '@/components/product/ProductFilters.jsx'
import { PageLoading, Empty } from '@/components/ui/index.jsx'
import { Package } from 'lucide-react'

export default function ProductsPage() {
  const [filters, setFilters] = useState({ sort: 'createdAt', order: 'desc', limit: 12 })
  const { data, isLoading, isFetching } = useProducts(filters)
  const products = data?.products ?? []

  return (
    <div className="page-container py-12">
      <div className="mb-10">
        <div className="font-mono text-xs text-ink-400 uppercase tracking-widest mb-2">Browse</div>
        <h1 className="section-title">Our Collection</h1>
        {data?.total > 0 && (
          <p className="text-sm text-ink-400 mt-2">{data.total} products</p>
        )}
      </div>

      <ProductFilters filters={filters} onChange={setFilters} />

      {isLoading ? <PageLoading /> : products.length === 0 ? (
        <Empty icon={Package} title="No products found" desc="Try adjusting your filters." />
      ) : (
        <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 transition-opacity ${isFetching ? 'opacity-60' : ''}`}>
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}

      {/* Load more */}
      {data?.nextCursor && (
        <div className="text-center mt-12">
          <button onClick={() => setFilters(f => ({ ...f, cursor: data.nextCursor }))}
            className="btn-secondary">
            Load more
          </button>
        </div>
      )}
    </div>
  )
}
