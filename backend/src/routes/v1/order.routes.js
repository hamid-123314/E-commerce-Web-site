import { Router } from 'express'
import { authenticate, authorize } from '../../middlewares/auth.js'
import { validate, validateQuery } from '../../middlewares/validate.js'
import { OrderController } from '../../controllers/order.controller.js'
import {
    createOrderSchema,
    updateOrderStatusSchema,
} from '../../validators/order.validator.js'
import { z } from 'zod'

const router = Router()

const paginationSchema = z.object({
    page:  z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
})

// Toutes les routes nécessitent d'être connecté
router.use(authenticate)

router.post('/',     validate(createOrderSchema),         OrderController.create)
router.get('/',      validateQuery(paginationSchema),     OrderController.getMyOrders)
router.get('/:id',                                        OrderController.getById)
router.post('/:id/cancel',                                OrderController.cancel)

// Admin uniquement
router.patch('/:id/status', authorize('admin'), validate(updateOrderStatusSchema), OrderController.updateStatus)

export default router