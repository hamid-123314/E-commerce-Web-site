import { Router } from 'express'
import { z } from 'zod'
import bcrypt from 'bcrypt'
import { authenticate } from '../../middlewares/auth.js'
import { validate } from '../../middlewares/validate.js'
import { prisma } from '../../config/database.js'
import { AppError } from '../../utils/AppError.js'

const router = Router()

// Toutes les routes nécessitent d'être connecté
router.use(authenticate)

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
}).strict()

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string()
    .min(8)
    .max(72)
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[0-9]/, 'Must contain number'),
})

// ── GET /users/me ─────────────────────────────────────────────────────────────
router.get('/me', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, name: true, email: true, role: true, createdAt: true,
        _count: { select: { orders: true } },
      },
    })
    if (!user) throw AppError.notFound('User not found')
    res.json({ status: 'success', data: { user } })
  } catch (err) { next(err) }
})

// ── PATCH /users/me ───────────────────────────────────────────────────────────
router.patch('/me', validate(updateProfileSchema), async (req, res, next) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: req.body,
      select: { id: true, name: true, email: true, role: true },
    })
    res.json({ status: 'success', data: { user } })
  } catch (err) { next(err) }
})

// ── PATCH /users/me/password ──────────────────────────────────────────────────
router.patch('/me/password', validate(changePasswordSchema), async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } })
    const valid = await bcrypt.compare(req.body.currentPassword, user.password)
    if (!valid) throw AppError.unauthorized('Current password is incorrect')

    const hashed = await bcrypt.hash(req.body.newPassword, 12)
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashed },
    })

    res.json({ status: 'success', message: 'Password updated successfully' })
  } catch (err) { next(err) }
})

// ── GET /users/me/orders ──────────────────────────────────────────────────────
router.get('/me/orders', async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: { product: { select: { id: true, name: true, imageUrl: true } } },
        },
      },
    })
    res.json({ status: 'success', data: { orders } })
  } catch (err) { next(err) }
})

export default router