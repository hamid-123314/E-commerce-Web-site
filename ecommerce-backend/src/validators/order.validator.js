import { z } from 'zod'

export const createOrderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().cuid('Invalid product ID'),
      quantity: z.number().int().min(1).max(100),
    })
  ).min(1, 'Order must contain at least one item'),
})

export const updateOrderStatusSchema = z.object({
  status: z.enum(['paid', 'shipped', 'delivered', 'cancelled', 'refunded']),
})

export const cartItemSchema = z.object({
  productId: z.string().cuid('Invalid product ID'),
  quantity: z.number().int().min(1).max(100),
})

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0).max(100), // 0 = supprime l'article
})