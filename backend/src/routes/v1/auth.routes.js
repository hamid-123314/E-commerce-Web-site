import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { validate } from '../../middlewares/validate.js'
import { authenticate } from '../../middlewares/auth.js'
import { AuthController } from '../../controllers/auth.controller.js'
import { registerSchema, loginSchema, refreshSchema } from '../../validators/auth.validator.js'

const router = Router()

// Stricter rate limit on auth endpoints — 5 attempts per 15 min
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: 'error', message: 'Too many attempts, please try again in 15 minutes' },
})

// Public routes
router.post('/register', authLimiter, validate(registerSchema), AuthController.register)
router.post('/login',    authLimiter, validate(loginSchema),    AuthController.login)
router.post('/refresh',  validate(refreshSchema),               AuthController.refresh)

// Protected routes
router.post('/logout', authenticate, AuthController.logout)
router.get('/me',      authenticate, AuthController.getMe)

export default router