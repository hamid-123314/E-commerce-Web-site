import Stripe from 'stripe'
import { env } from '../config/env.js'
import { prisma } from '../config/database.js'
import { OrderService } from './order.service.js'
import { EmailService } from './email.service.js'
import { AppError } from '../utils/AppError.js'

const stripe = new Stripe(env.STRIPE_SECRET_KEY)

export class PaymentService {

    // ── Créer une session Stripe Checkout ───────────────────────────────────────
    static async createCheckoutSession(userId, orderId) {
        const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            items: {
            include: { product: { select: { name: true, imageUrl: true, price: true } } },
            },
            user: { select: { email: true, name: true } },
        },
        })

        if (!order) throw AppError.notFound('Order not found')
        if (order.userId !== userId) throw AppError.forbidden('Access denied')
        if (order.status !== 'pending') throw AppError.badRequest('Order is not in pending state')

        // Construire les line_items depuis la DB — jamais depuis le client
        const lineItems = order.items.map(item => ({
        price_data: {
            currency: 'eur',
            unit_amount: Math.round(Number(item.product.price) * 100), // Stripe en centimes
            product_data: {
            name: item.product.name,
            ...(item.product.imageUrl && { images: [item.product.imageUrl] }),
            },
        },
        quantity: item.quantity,
        }))

        const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        customer_email: order.user.email,
        success_url: `${env.CLIENT_URL}/orders/${orderId}?success=true`,
        cancel_url:  `${env.CLIENT_URL}/cart?cancelled=true`,
        metadata: { orderId, userId },
        })

        // Sauvegarder le sessionId Stripe sur la commande
        await prisma.order.update({
        where: { id: orderId },
        data: { stripeSessionId: session.id },
        })

        return { checkoutUrl: session.url, sessionId: session.id }
    }

    // ── Handler webhook Stripe ──────────────────────────────────────────────────
    // Appelé par Stripe après paiement — vérifie la signature avant tout traitement
    static async handleWebhook(rawBody, stripeSignature) {
        let event

        try {
        event = stripe.webhooks.constructEvent(
            rawBody,
            stripeSignature,
            env.STRIPE_WEBHOOK_SECRET
        )
        } catch (err) {
        throw AppError.badRequest(`Webhook signature verification failed: ${err.message}`)
        }

        switch (event.type) {

        case 'checkout.session.completed': {
            const session = event.data.object
            const { orderId } = session.metadata

            // Confirmer la commande — idempotent (safe si appelé 2x)
            const order = await OrderService.confirmPayment(orderId, session.payment_intent)

            // Envoyer email de confirmation
            await EmailService.sendOrderConfirmation(order)
            break
        }

        case 'checkout.session.expired': {
            // Session expirée sans paiement — remettre en stock si needed
            const session = event.data.object
            if (session.metadata?.orderId) {
            const order = await prisma.order.findUnique({
                where: { id: session.metadata.orderId },
            })
            if (order?.status === 'pending') {
                await OrderService.cancelOrder(order.id, order.userId, 'admin')
            }
            }
            break
        }

        case 'charge.refunded': {
            const charge = event.data.object
            const payment = await stripe.paymentIntents.retrieve(charge.payment_intent)
            const order = await prisma.order.findFirst({
            where: { stripePaymentId: payment.id },
            })
            if (order) {
            await prisma.order.update({
                where: { id: order.id },
                data: { status: 'refunded' },
            })
            }
            break
        }

        default:
            // Ignorer les événements non gérés — ne pas lancer d'erreur
            break
        }

        return { received: true }
    }

    // ── Rembourser une commande (admin) ─────────────────────────────────────────
    static async refundOrder(orderId) {
        const order = await prisma.order.findUnique({ where: { id: orderId } })
        if (!order) throw AppError.notFound('Order not found')
        if (order.status !== 'paid' && order.status !== 'shipped') {
        throw AppError.badRequest('Only paid or shipped orders can be refunded')
        }
        if (!order.stripePaymentId) {
        throw AppError.badRequest('No payment ID found on this order')
        }

        await stripe.refunds.create({ payment_intent: order.stripePaymentId })

        return prisma.order.update({
        where: { id: orderId },
        data: { status: 'refunded' },
        })
    }
}