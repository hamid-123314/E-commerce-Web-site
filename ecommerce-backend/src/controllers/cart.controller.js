import { CartService } from '../services/cart.service.js'

export class CartController {

    static async getCart(req, res, next) {
        try {
        const cart = await CartService.getCart(req.user?.id, req.headers['x-session-id'])
        res.json({ status: 'success', data: { cart } })
        } catch (err) { next(err) }
    }

    static async addItem(req, res, next) {
        try {
        const cart = await CartService.addItem(
            req.user?.id,
            req.headers['x-session-id'],
            req.body
        )
        res.status(201).json({ status: 'success', data: { cart } })
        } catch (err) { next(err) }
    }

    static async updateItem(req, res, next) {
        try {
        const cart = await CartService.updateItem(
            req.user?.id,
            req.headers['x-session-id'],
            req.params.productId,
            req.body.quantity
        )
        res.json({ status: 'success', data: { cart } })
        } catch (err) { next(err) }
    }

    static async removeItem(req, res, next) {
        try {
        await CartService.removeItem(
            req.user?.id,
            req.headers['x-session-id'],
            req.params.productId
        )
        res.status(204).send()
        } catch (err) { next(err) }
    }

    static async clearCart(req, res, next) {
        try {
        await CartService.clearCart(req.user?.id, req.headers['x-session-id'])
        res.status(204).send()
        } catch (err) { next(err) }
    }
}