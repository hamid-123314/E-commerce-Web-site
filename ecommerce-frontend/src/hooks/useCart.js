import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { cartService, orderService, paymentService } from '@/lib/services.js'
import { getErrorMessage } from '@/lib/api.js'

export const useCart = () =>
  useQuery({
    queryKey: ['cart'],
    queryFn:  cartService.get,
    retry: 1,
  })

export const useAddToCart = () => {
  const qc = useQueryClient()

  return useMutation({
    // ✅ mutationFn only sends what the API needs — NOT the full product object
    mutationFn: ({ productId, quantity }) =>
      cartService.addItem({ productId, quantity }),

    // ✅ Full optimistic update — UI changes instantly, no waiting for API
    onMutate: async ({ product, productId, quantity }) => {
      // Cancel in-flight cart queries to avoid overwriting our optimistic update
      await qc.cancelQueries({ queryKey: ['cart'] })

      // Snapshot current cart state for rollback on error
      const previousCart = qc.getQueryData(['cart'])

      // Immediately update the cache
      qc.setQueryData(['cart'], (old) => {
        const items    = old?.items ?? []
        const pid      = product?.id ?? productId
        const existing = items.find(i => i.productId === pid)

        const newItems = existing
          ? items.map(i =>
              i.productId === pid
                ? { ...i, quantity: i.quantity + quantity }
                : i
            )
          : [
              ...items,
              {
                productId: pid,
                quantity,
                unitPrice: Number(product?.price ?? 0),
                product: {
                  id:       pid,
                  name:     product?.name     ?? '',
                  imageUrl: product?.imageUrl ?? null,
                },
              },
            ]

        const total = newItems.reduce(
          (s, i) => s + Number(i.unitPrice) * i.quantity, 0
        )
        return { items: newItems, total: Number(total.toFixed(2)) }
      })

      return { previousCart }
    },

    onSuccess: (serverCart) => {
      // Sync with real server data after API responds
      if (serverCart) qc.setQueryData(['cart'], serverCart)
      else qc.invalidateQueries({ queryKey: ['cart'] })
      toast.success('Added to cart')
    },

    onError: (err, _, context) => {
      // Rollback to previous cart state
      if (context?.previousCart) {
        qc.setQueryData(['cart'], context.previousCart)
      }
      toast.error(getErrorMessage(err))
    },

    onSettled: () => {
      // Always resync with server after mutation
      qc.invalidateQueries({ queryKey: ['cart'] })
    },
  })
}

export const useUpdateCartItem = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ productId, quantity }) =>
      cartService.updateItem(productId, quantity),

    onMutate: async ({ productId, quantity }) => {
      await qc.cancelQueries({ queryKey: ['cart'] })
      const previousCart = qc.getQueryData(['cart'])

      qc.setQueryData(['cart'], (old) => {
        const items = (old?.items ?? [])
          .map(i => i.productId === productId ? { ...i, quantity } : i)
          .filter(i => i.quantity > 0)
        const total = items.reduce((s, i) => s + Number(i.unitPrice) * i.quantity, 0)
        return { ...old, items, total: Number(total.toFixed(2)) }
      })

      return { previousCart }
    },

    onError: (err, _, context) => {
      if (context?.previousCart) qc.setQueryData(['cart'], context.previousCart)
      toast.error(getErrorMessage(err))
    },

    onSettled: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  })
}

export const useRemoveCartItem = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: cartService.removeItem,

    onMutate: async (productId) => {
      await qc.cancelQueries({ queryKey: ['cart'] })
      const previousCart = qc.getQueryData(['cart'])

      qc.setQueryData(['cart'], (old) => {
        const items = (old?.items ?? []).filter(i => i.productId !== productId)
        const total = items.reduce((s, i) => s + Number(i.unitPrice) * i.quantity, 0)
        return { ...old, items, total: Number(total.toFixed(2)) }
      })

      return { previousCart }
    },

    onSuccess:  () => toast.success('Item removed'),

    onError: (err, _, context) => {
      if (context?.previousCart) qc.setQueryData(['cart'], context.previousCart)
      toast.error(getErrorMessage(err))
    },

    onSettled: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  })
}

export const useCheckout = () =>
  useMutation({
    mutationFn: async (items) => {
      const order = await orderService.create(items)
      const { checkoutUrl } = await paymentService.createCheckout(order.id)
      window.location.href = checkoutUrl
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
