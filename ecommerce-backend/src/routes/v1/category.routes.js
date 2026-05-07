import { Router } from 'express'
import { prisma } from '../../config/database.js'
import { authenticate, authorize } from '../../middlewares/auth.js'
import { validate } from '../../middlewares/validate.js'
import { AppError } from '../../utils/AppError.js'
import { z } from 'zod'

const router = Router()

const categorySchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
})

// ── Public ────────────────────────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } },
    })
    res.json({ status: 'success', data: { categories } })
  } catch (err) { next(err) }
})

router.get('/:id', async (req, res, next) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: req.params.id },
      include: { products: { take: 10, orderBy: { createdAt: 'desc' } } },
    })
    if (!category) throw AppError.notFound('Category not found')
    res.json({ status: 'success', data: { category } })
  } catch (err) { next(err) }
})

// ── Admin only ────────────────────────────────────────────────────────────────
router.use(authenticate, authorize('admin'))

router.post('/', validate(categorySchema), async (req, res, next) => {
  try {
    const category = await prisma.category.create({ data: req.body })
    res.status(201).json({ status: 'success', data: { category } })
  } catch (err) { next(err) }
})

router.patch('/:id', validate(categorySchema.partial()), async (req, res, next) => {
  try {
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: req.body,
    })
    res.json({ status: 'success', data: { category } })
  } catch (err) { next(err) }
})

router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.category.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (err) { next(err) }
})

export default router