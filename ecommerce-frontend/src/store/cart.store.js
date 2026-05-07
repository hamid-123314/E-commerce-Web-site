// store/cart.store.js — État local du panier (Zustand)
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'

// Génère un sessionId unique pour les invités
const getSessionId = () => {
  let id = localStorage.getItem('sessionId')
  if (!id) { id = nanoid(); localStorage.setItem('sessionId', id) }
  return id
}

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      sessionId: getSessionId(),

      // Nombre total d'articles (pour le badge panier)
      get count() {
        return get().items.reduce((sum, i) => sum + i.quantity, 0)
      },

      // Total calculé localement (approximatif — le vrai total vient du serveur)
      get total() {
        return get().items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
      },

      // Synchronise le panier depuis la réponse API
      setCart: (cart) => set({ items: cart.items ?? [] }),

      // Optimistic update local
      addItem: (product, quantity = 1) => set((state) => {
        const existing = state.items.find(i => i.productId === product.id)
        if (existing) {
          return {
            items: state.items.map(i =>
              i.productId === product.id
                ? { ...i, quantity: i.quantity + quantity }
                : i
            ),
          }
        }
        return {
          items: [...state.items, {
            productId: product.id,
            quantity,
            unitPrice: Number(product.price),
            product: { id: product.id, name: product.name, imageUrl: product.imageUrl },
          }],
        }
      }),

      removeItem: (productId) => set((state) => ({
        items: state.items.filter(i => i.productId !== productId),
      })),

      updateQuantity: (productId, quantity) => set((state) => ({
        items: state.items.map(i =>
          i.productId === productId ? { ...i, quantity } : i
        ).filter(i => i.quantity > 0),
      })),

      clear: () => set({ items: [] }),
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
)
