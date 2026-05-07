import { prisma } from "../config/database.js";
import { redis } from "../config/redis.js";
import { AppError } from "../utils/AppError.js";

const GUEST_CART_TTL = 7 * 24 * 60 * 60; // 7 jours
const guestKey = (sessionId) => `cart:session:${sessionId}`;

export class CartService {
    
    // ── Récupérer le panier ─────────────────────────────────────────────────────
    static async getCart(userId, sessionId) {
        if (userId) return CartService.#getDbCart(userId);
        if (sessionId) return CartService.#getGuestCart(sessionId);
        return { items: [], total: 0 };
    }

    // ── Ajouter un article ──────────────────────────────────────────────────────
    static async addItem(userId, sessionId, { productId, quantity }) {
        const product = await prisma.product.findUnique({
        where: { id: productId },
        });
        if (!product) throw AppError.notFound("Product not found");
        if (product.stock < quantity)
        throw AppError.badRequest(`Only ${product.stock} items in stock`);

        if (userId)
        return CartService.#addToDbCart(
            userId,
            productId,
            quantity,
            product.price,
        );
        return CartService.#addToGuestCart(
        sessionId,
        productId,
        quantity,
        product.price,
        );
    }

    // ── Modifier la quantité ────────────────────────────────────────────────────
    static async updateItem(userId, sessionId, productId, quantity) {
        if (quantity <= 0)
        return CartService.removeItem(userId, sessionId, productId);
        if (userId)
        return CartService.#updateDbCartItem(userId, productId, quantity);
        return CartService.#updateGuestCartItem(sessionId, productId, quantity);
    }

    // ── Supprimer un article ────────────────────────────────────────────────────
    static async removeItem(userId, sessionId, productId) {
        if (userId) {
        await prisma.cartItem.deleteMany({
            where: { cart: { userId }, productId },
        });
        } else {
        const cart = await CartService.#getGuestCart(sessionId);
        const updated = cart.items.filter((i) => i.productId !== productId);
        await redis.set(guestKey(sessionId), JSON.stringify(updated), {
            EX: GUEST_CART_TTL,
        });
        }
    }

    // ── Vider le panier ─────────────────────────────────────────────────────────
    static async clearCart(userId, sessionId) {
        if (userId) {
        const cart = await prisma.cart.findUnique({ where: { userId } });
        if (cart)
            await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
        } else {
        await redis.del(guestKey(sessionId));
        }
    }

    // ── Fusion panier invité → panier authentifié (appelé au login) ─────────────
    static async mergeGuestCart(userId, sessionId) {
        if (!sessionId) return;

        const guestCart = await CartService.#getGuestCart(sessionId);
        if (!guestCart.items.length) return;

        for (const item of guestCart.items) {
        try {
            await CartService.addItem(userId, null, {
            productId: item.productId,
            quantity: item.quantity,
            });
        } catch {
            // Article plus disponible en stock — on l'ignore
        }
        }

        await redis.del(guestKey(sessionId));
    }

    // ── Private: DB cart ────────────────────────────────────────────────────────
    static async #getDbCart(userId) {
        const cart = await prisma.cart.findUnique({
        where: { userId },
        include: {
            items: {
            include: {
                product: {
                select: {
                    id: true,
                    name: true,
                    price: true,
                    imageUrl: true,
                    stock: true,
                },
                },
            },
            },
        },
        });
        if (!cart) return { items: [], total: 0 };

        const total = cart.items.reduce(
        (sum, i) => sum + Number(i.product.price) * i.quantity,
        0,
        );
        return { items: cart.items, total: Number(total.toFixed(2)) };
    }

    static async #addToDbCart(userId, productId, quantity, price) {
        let cart = await prisma.cart.findUnique({ where: { userId } });
        if (!cart) cart = await prisma.cart.create({ data: { userId } });

        const existing = await prisma.cartItem.findFirst({
        where: { cartId: cart.id, productId },
        });

        if (existing) {
        await prisma.cartItem.update({
            where: { id: existing.id },
            data: { quantity: existing.quantity + quantity },
        });
        } else {
        await prisma.cartItem.create({
            data: { cartId: cart.id, productId, quantity, unitPrice: price },
        });
        }

        return CartService.#getDbCart(userId);
    }

    static async #updateDbCartItem(userId, productId, quantity) {
        const cart = await prisma.cart.findUnique({ where: { userId } });
        if (!cart) throw AppError.notFound("Cart not found");

        await prisma.cartItem.updateMany({
        where: { cartId: cart.id, productId },
        data: { quantity },
        });

        return CartService.#getDbCart(userId);
    }

    // ── Private: Redis guest cart ────────────────────────────────────────────────
    static async #getGuestCart(sessionId) {
        const raw = await redis.get(guestKey(sessionId));
        const items = raw ? JSON.parse(raw) : [];
        const total = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
        return { items, total: Number(total.toFixed(2)) };
    }

    static async #addToGuestCart(sessionId, productId, quantity, price) {
        const cart = await CartService.#getGuestCart(sessionId);
        const existing = cart.items.find((i) => i.productId === productId);

        if (existing) {
        existing.quantity += quantity;
        } else {
        cart.items.push({ productId, quantity, unitPrice: Number(price) });
        }

        await redis.set(guestKey(sessionId), JSON.stringify(cart.items), {
        EX: GUEST_CART_TTL,
        });
        return CartService.#getGuestCart(sessionId);
    }

    static async #updateGuestCartItem(sessionId, productId, quantity) {
        const cart = await CartService.#getGuestCart(sessionId);
        const item = cart.items.find((i) => i.productId === productId);
        if (item) item.quantity = quantity;
        await redis.set(guestKey(sessionId), JSON.stringify(cart.items), {
        EX: GUEST_CART_TTL,
        });
        return CartService.#getGuestCart(sessionId);
    }
}
