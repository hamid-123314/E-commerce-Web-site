import { CartService } from '../services/cart.service.js'
import { logger } from '../config/logger.js'

export class CartController {

  static async getCart(req, res, next) {
    try {
      const cart = await CartService.getCart(req.user?.id, req.headers['x-session-id'])
      res.json({ status: 'success', data: { cart } })
    } catch (err) {
      logger.error('getCart error:', err)
      next(err)
    }
  }

  static async addItem(req, res, next) {
    try {
      logger.info('addItem called', {
        userId: req.user?.id,
        sessionId: req.headers['x-session-id'],
        body: req.body,
      })

      const cart = await CartService.addItem(
        req.user?.id,
        req.headers['x-session-id'],
        req.body
      )

      logger.info('addItem success', { cart })
      res.status(201).json({ status: 'success', data: { cart } })
    } catch (err) {
      logger.error('addItem FAILED:', {
        message: err.message,
        stack: err.stack,
        code: err.code,
      })
      next(err)
    }
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
    } catch (err) {
      logger.error('updateItem error:', err)
      next(err)
    }
  }

  static async removeItem(req, res, next) {
    try {
      await CartService.removeItem(
        req.user?.id,
        req.headers['x-session-id'],
        req.params.productId
      )
      res.status(204).send()
    } catch (err) {
      logger.error('removeItem error:', err)
      next(err)
    }
  }

  static async clearCart(req, res, next) {
    try {
      await CartService.clearCart(req.user?.id, req.headers['x-session-id'])
      res.status(204).send()
    } catch (err) {
      logger.error('clearCart error:', err)
      next(err)
    }
  }
}
