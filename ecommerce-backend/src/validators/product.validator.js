import { z } from 'zod'

export const createProductSchema = z.object({
  name:        z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  price:       z.number().positive(),
  stock:       z.number().int().min(0),
  imageUrl:    z.string().url().optional(),
  categoryId:  z.string().uuid(),
})

export const updateProductSchema = createProductSchema.partial()

export const productQuerySchema = z.object({
  page:       z.coerce.number().int().positive().default(1),
  limit:      z.coerce.number().int().min(1).max(50).default(20),
  search:     z.string().optional(),
  categoryId: z.string().uuid().optional(),
  sort:       z.enum(['name', 'price', 'createdAt']).default('createdAt'),
  order:      z.enum(['asc', 'desc']).default('desc'),
  cursor:     z.string().optional(),
})