import { prisma } from '../config/database.js'
import { redis } from '../config/redis.js'
import { AppError } from '../utils/AppError.js'

const GUEST_CART_TTL = 7 * 24 * 60 * 60
const guestKey = (sid) => `cart:session:${sid}`

export class CartService {

  // ── Get cart ────────────────────────────────────────────────────────────────
  static async getCart(userId, sessionId) {
    if (userId)    return CartService.#getDbCart(userId)
    if (sessionId) return CartService.#getGuestCart(sessionId)
    return { items: [], total: 0 }
  }

  // ── Add item ────────────────────────────────────────────────────────────────
  static async addItem(userId, sessionId, { productId, quantity }) {
    // Single query — fetch product only
    const product = await prisma.product.findUnique({
      where:  { id: productId },
      select: { id: true, price: true, stock: true }, // ✅ select only what we need
    })
    if (!product) throw AppError.notFound('Product not found')
    if (product.stock < quantity) {
      throw AppError.badRequest(`Only ${product.stock} items in stock`)
    }

    if (userId) return CartService.#addToDbCart(userId, productId, quantity, product.price)
    return CartService.#addToGuestCart(sessionId, productId, quantity, product.price)
  }

  // ── Update quantity ─────────────────────────────────────────────────────────
  static async updateItem(userId, sessionId, productId, quantity) {
    if (quantity <= 0) return CartService.removeItem(userId, sessionId, productId)
    if (userId)    return CartService.#updateDbCartItem(userId, productId, quantity)
    return CartService.#updateGuestCartItem(sessionId, productId, quantity)
  }

  // ── Remove item ─────────────────────────────────────────────────────────────
  static async removeItem(userId, sessionId, productId) {
    if (userId) {
      // ✅ Single query with nested where — no need to fetch cart first
      await prisma.cartItem.deleteMany({
        where: { cart: { userId }, productId },
      })
    } else {
      const cart = await CartService.#getGuestCart(sessionId)
      const updated = cart.items.filter(i => i.productId !== productId)
      await redis.set(guestKey(sessionId), JSON.stringify(updated), { EX: GUEST_CART_TTL })
    }
  }

  // ── Clear cart ──────────────────────────────────────────────────────────────
  static async clearCart(userId, sessionId) {
    if (userId) {
      await prisma.cartItem.deleteMany({ where: { cart: { userId } } })
    } else {
      await redis.del(guestKey(sessionId))
    }
  }

  // ── Merge guest cart on login ───────────────────────────────────────────────
  static async mergeGuestCart(userId, sessionId) {
    if (!sessionId) return
    const guestCart = await CartService.#getGuestCart(sessionId)
    if (!guestCart.items.length) return

    for (const item of guestCart.items) {
      try {
        await CartService.addItem(userId, null, {
          productId: item.productId,
          quantity:  item.quantity,
        })
      } catch { /* item out of stock — skip silently */ }
    }

    await redis.del(guestKey(sessionId))
  }

  // ── Private: DB cart ────────────────────────────────────────────────────────

  static async #getDbCart(userId) {
    const cart = await prisma.cart.findUnique({
      where:   { userId },
      select: {
        items: {
          select: {
            id: true, quantity: true, unitPrice: true,
            productId: true,
            product: { select: { id: true, name: true, price: true, imageUrl: true, stock: true } },
          },
        },
      },
    })
    if (!cart) return { items: [], total: 0 }
    const total = cart.items.reduce((s, i) => s + Number(i.product.price) * i.quantity, 0)
    return { items: cart.items, total: Number(total.toFixed(2)) }
  }

  static async #addToDbCart(userId, productId, quantity, price) {
    // ✅ FIX: upsert Cart + upsert CartItem = 2 queries max instead of 4
    // 1. Ensure cart exists (upsert)
    const cart = await prisma.cart.upsert({
      where:  { userId },
      create: { userId },
      update: {},
      select: { id: true },
    })

    // 2. Upsert the cart item — increment if exists, create if not
    await prisma.cartItem.upsert({
      where:  { cartId_productId: { cartId: cart.id, productId } },
      create: { cartId: cart.id, productId, quantity, unitPrice: price },
      update: { quantity: { increment: quantity } },
    })

    // 3. Return updated cart
    return CartService.#getDbCart(userId)
  }

  static async #updateDbCartItem(userId, productId, quantity) {
    // ✅ FIX: single updateMany with nested where — no cart lookup needed
    await prisma.cartItem.updateMany({
      where: { cart: { userId }, productId },
      data:  { quantity },
    })
    return CartService.#getDbCart(userId)
  }

  // ── Private: Redis guest cart ────────────────────────────────────────────────

  static async #getGuestCart(sessionId) {
    const raw   = await redis.get(guestKey(sessionId))
    const items = raw ? JSON.parse(raw) : []
    const total = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
    return { items, total: Number(total.toFixed(2)) }
  }

  static async #addToGuestCart(sessionId, productId, quantity, price) {
    const cart     = await CartService.#getGuestCart(sessionId)
    const existing = cart.items.find(i => i.productId === productId)
    if (existing) {
      existing.quantity += quantity
    } else {
      cart.items.push({ productId, quantity, unitPrice: Number(price) })
    }
    await redis.set(guestKey(sessionId), JSON.stringify(cart.items), { EX: GUEST_CART_TTL })
    return CartService.#getGuestCart(sessionId)
  }

  static async #updateGuestCartItem(sessionId, productId, quantity) {
    const cart = await CartService.#getGuestCart(sessionId)
    const item = cart.items.find(i => i.productId === productId)
    if (item) item.quantity = quantity
    await redis.set(guestKey(sessionId), JSON.stringify(cart.items), { EX: GUEST_CART_TTL })
    return CartService.#getGuestCart(sessionId)
  }
}
