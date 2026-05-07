// pages/admin/AdminProducts.jsx
import { useState } from 'react'
import { Plus, Pencil, Trash2, Package } from 'lucide-react'
import { useProducts, useDeleteProduct } from '@/hooks/useProducts.js'
import { formatPrice } from '@/lib/utils.js'
import { PageLoading, Button, Empty } from '@/components/ui/index.jsx'

export default function AdminProducts() {
  const { data, isLoading } = useProducts({ limit: 50 })
  const deleteProduct = useDeleteProduct()
  const products = data?.products ?? []

  if (isLoading) return <PageLoading />

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="font-mono text-xs text-ink-400 uppercase tracking-widest mb-1">Manage</div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">Products</h1>
        </div>
        <Button className="gap-2">
          <Plus size={14} /> Add Product
        </Button>
      </div>

      {products.length === 0 ? (
        <Empty icon={Package} title="No products" desc="Add your first product." />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100">
                {['Product', 'Category', 'Price', 'Stock', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium text-ink-400 uppercase tracking-wider font-mono">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-ink-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-medium text-ink-900">{p.name}</div>
                  </td>
                  <td className="px-5 py-4 text-ink-500">{p.category?.name ?? '—'}</td>
                  <td className="px-5 py-4 font-mono font-medium">{formatPrice(p.price)}</td>
                  <td className="px-5 py-4">
                    <span className={`font-mono font-medium ${p.stock <= 5 ? 'text-rose' : p.stock <= 10 ? 'text-amber-dark' : 'text-sage'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 text-ink-400 hover:text-ink-900 transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => deleteProduct.mutate(p.id)}
                        className="p-1.5 text-ink-400 hover:text-rose transition-colors"
                        disabled={deleteProduct.isPending}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
