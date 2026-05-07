import { prisma } from '../config/database.js'
import { AppError } from '../utils/AppError.js'

// Transitions autorisées — on ne peut pas sauter des étapes
const VALID_TRANSITIONS = {
    pending:   ['paid', 'cancelled'],
    paid:      ['shipped', 'cancelled'],
    shipped:   ['delivered'],
    delivered: [],
    cancelled: [],
    refunded:  [],
}


export class OrderService {

    // ── Créer une commande (transaction atomique) ───────────────────────────────
    static async createOrder(userId, items){
        if(!items?.length) throw AppError.badRequest("Order must contain at least one item")
            
        // Récupérer les vrais prix depuis la DB — ne jamais faire confiance au client
        const productsId = items.map(i => i.productId)
        const products = await prisma.product.findMany({
            where: { id: { in: productsId }},
        })

        // Vérifier que tous les produits existent
        if(products.length !== productsId.length) 
            throw AppError.badRequest('One or more items not found')

        const productMap = Object.fromEntries(products.map(p => [p.id, p]))

        // Vérifier le stock avant la transaction
        for(const item of items){
            const product = productMap[item.productId]
            if(product.stock < item.quantity) 
                throw AppError.badRequest(`Insufficient stock for "${product.name}". Available: ${product.stock}`)
        }

        // Calculer le total côté serveur
        const total = items.reduce((sum, item)=>{
            return sum + Number(productMap[item.productId].price) * item.quantity
        }, 0)

        // ── Transaction atomique ─────────────────────────────────────────────────
        // Si le décrement de stock ou la création de commande échoue,
        // TOUT est annulé — aucune commande sans stock décrémenté et vice versa.
        const order = await prisma.$transaction(async (tx) => {
            // 1. Décrémenter le stock de chaque produit
            for(const item of items){
                await prisma.product.update({
                    where: { id: item.productId},
                    data: { stock: { decrement: item.quantity}},
                })
            }

            // 2. Créer la commande avec ses articles
            return tx.order.create({
                data: {
                    userId,
                    total,
                    status: 'pending',
                    items: {
                        create: items.map(item => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            unitPrice: productMap[item.productId].price
                        })),
                    },
                },
                include: {
                    items: {
                        include: {
                            product: {
                                select : { id: true, name: true, imageUrl: true }
                            }
                        },
                    },
                },
            })
        })

        return order
    }

    // ── Lister les commandes d'un utilisateur ───────────────────────────────────
    static async getUserOrders(userId, { page = 1, limit = 10} = {}){
        const skip = (page - 1) * limit

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where: { userId },
                orderBy: { createdAt : 'desc' },
                skip,
                take: limit,
                include: {
                    items: {
                        include: { select: { id:true, name:true, imageUrl:true }}
                    }
                }
            }),
            prisma.order.count({ where : {userId} }),
        ])

        return { orders, total, page, totalPages : Math.ceil(total / limit)}
    }

    // ── Détail d'une commande ───────────────────────────────────────────────────
    static async getOrderById(orderId, userId, role) {
        const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            user: { select: { id: true, name: true, email: true } },
            items: {
            include: { product: { select: { id: true, name: true, imageUrl: true } } },
            },
        },
        })
    
        if (!order) throw AppError.notFound('Order not found')
    
        // Un customer ne peut voir que SES commandes
        if (role !== 'admin' && order.userId !== userId) {
        throw AppError.forbidden('Access denied')
        }
    
        return order
    }

    // ── Mettre à jour le statut (admin) ────────────────────────────────────────
    static async updateStatus(orderId, newStatus) {
        const order = await prisma.order.findUnique({ where: { id: orderId } })
        if (!order) throw AppError.notFound('Order not found')
    
        const allowed = VALID_TRANSITIONS[order.status]
        if (!allowed.includes(newStatus)) {
        throw AppError.badRequest(
            `Cannot transition from "${order.status}" to "${newStatus}". Allowed: ${allowed.join(', ') || 'none'}`
        )
        }
    
        return prisma.order.update({
            where: { id: orderId },
            data: { status: newStatus },
        })
    }

    // ── Confirmer après paiement Stripe (appelé par webhook) ───────────────────
    static async confirmPayment(stripeSessionId, stripePaymentId) {
        const order = await prisma.order.findUnique({ where: { stripeSessionId } })
        if (!order) throw AppError.notFound('Order not found for this session')
        if (order.status === 'paid') return order // idempotent — déjà confirmé
    
        return prisma.order.update({
            where: { id: order.id },
            data: { status: 'paid', stripePaymentId },
        })
    }

      // ── Annuler + remettre en stock ─────────────────────────────────────────────
    static async cancelOrder(orderId, userId, role) {
        const order = await OrderService.getOrderById(orderId, userId, role)
    
        if (!VALID_TRANSITIONS[order.status].includes('cancelled')) {
        throw AppError.badRequest(`Cannot cancel an order with status "${order.status}"`)
        }
    
        return prisma.$transaction(async (tx) => {
        // Remettre en stock
        for (const item of order.items) {
            await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
            })
        }
    
        return tx.order.update({
            where: { id: orderId },
            data: { status: 'cancelled' },
        })
        })
    }


}