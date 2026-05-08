import { prisma } from '../config/database.js'
import { cache } from '../config/redis.js'
import { AppError } from '../utils/AppError.js'

const PRODUCT_TTL = 300 // 5 minutes

export class ProductService {
  static async findMany({ page = '1', limit = '20', search, categoryId, sort = 'createdAt', order = 'desc', cursor }) {
    const take = Math.min(parseInt(limit), 50)

    const where = {
      ...(search && {
        OR: [
          { name : { contains: search, mode: 'insensitive'}},
          { description : { contains: search, mode: 'insensitive'}}
        ],
      }),
      ...(categoryId && { categoryId }),
    }

    const [ products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        take,
        ...(cursor && { skip: 1, cursor: { id: cursor }}),
        orderBy: { [sort]: order},
        include : { category: { select: { id: true, name: true}}}
      }),
      prisma.product.count({ where }),
    ])

    const nextCursor = products.length === take ? products.at(-1)?.id : null
    return { products, total, nextCursor }
  }

  static async findById(id) {
    const cacheKey = `product:${id}`
    const cached = await cache.get(cacheKey)
    if(cached) return cached

    const product = prisma.product.findUnique({
      where : { id },
      include: { category: true}
    })

    if(!product) throw AppError.notFound("Product not found")

    await cache.set(cacheKey, product, PRODUCT_TTL)
    return product
  }

  static async create(data, imageData){
    const product = await prisma.product.create({
    data: {
      ...data,           // Spread the existing product fields (name, price, etc.)
      imageUrl: imageData.imageUrl, // Add the new image URL
      imagePublicId: imageData.imagePublicId
    },
    include: { category: true }
  })

    await redis.delPattern('products:*')
    return product
  }

  static async update(id, data){
    await ProductService.findById(id)
    const product = prisma.product.update({
      where: {id},
      data,
      include: {category: true}
    })

    await cache.del(`product:${id}`)
    await cache.delPattern('products:*')
    return product
  }

  static async delete(id){
    await ProductService.findById(id)
    await prisma.product.del(id)
    await cache.del(`product:${id}`)
    await cache.delPattern('products:*')
  }

}
