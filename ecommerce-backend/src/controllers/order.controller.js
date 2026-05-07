import { OrderService } from '../services/order.service.js'

export class OrderController {

    static async create(req, res, next) {
        try {
        const order = await OrderService.createOrder(req.user.id, req.body.items)
        res.status(201).json({ status: 'success', data: { order } })
        } catch (err) { next(err) }
    }

    static async getMyOrders(req, res, next) {
        try {
        const result = await OrderService.getUserOrders(req.user.id, req.query)
        res.json({ status: 'success', data: result })
        } catch (err) { next(err) }
    }

    static async getById(req, res, next) {
        try {
        const order = await OrderService.getOrderById(req.params.id, req.user.id, req.user.role)
        res.json({ status: 'success', data: { order } })
        } catch (err) { next(err) }
    }

    static async cancel(req, res, next) {
        try {
        const order = await OrderService.cancelOrder(req.params.id, req.user.id, req.user.role)
        res.json({ status: 'success', data: { order } })
        } catch (err) { next(err) }
    }

    // Admin only
    static async updateStatus(req, res, next) {
        try {
        const order = await OrderService.updateStatus(req.params.id, req.body.status)
        res.json({ status: 'success', data: { order } })
        } catch (err) { next(err) }
    }
}