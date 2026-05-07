// components/product/ProductFilters.jsx
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useCategories } from '@/hooks/useProducts.js'

export default function ProductFilters({ filters, onChange }) {
  const { data: categories = [] } = useCategories()

  const handleChange = (key, value) => onChange({ ...filters, [key]: value, cursor: undefined })
  const hasFilters = filters.search || filters.categoryId || filters.sort !== 'createdAt'

  return (
    <div className="flex flex-wrap gap-3 items-center mb-8">
      {/* Search */}
      <div className="relative flex-1 min-w-48">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
        <input
          value={filters.search ?? ''}
          onChange={e => handleChange('search', e.target.value)}
          placeholder="Search products..."
          className="input pl-9 py-2.5 text-sm"
        />
      </div>

      {/* Category */}
      <select value={filters.categoryId ?? ''}
        onChange={e => handleChange('categoryId', e.target.value || undefined)}
        className="input py-2.5 text-sm w-auto min-w-36">
        <option value="">All categories</option>
        {categories.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      {/* Sort */}
      <select value={`${filters.sort ?? 'createdAt'}_${filters.order ?? 'desc'}`}
        onChange={e => {
          const [sort, order] = e.target.value.split('_')
          onChange({ ...filters, sort, order, cursor: undefined })
        }}
        className="input py-2.5 text-sm w-auto">
        <option value="createdAt_desc">Newest first</option>
        <option value="createdAt_asc">Oldest first</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
        <option value="name_asc">Name A–Z</option>
      </select>

      {/* Clear */}
      {hasFilters && (
        <button onClick={() => onChange({ sort: 'createdAt', order: 'desc' })}
          className="btn-ghost text-xs flex items-center gap-1.5 text-rose">
          <X size={13} /> Clear
        </button>
      )}
    </div>
  )
}
