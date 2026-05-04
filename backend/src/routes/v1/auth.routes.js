import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { validate } from '../../middlewares/validate.js'
import { authenticate } from '../../middlewares/auth.js'
import { AuthController } from '../../controllers/auth.controller.js'
import { registerSchema, loginSchema } from '../../validators/auth.validator.js'
 
const router = Router()

// Stricter rate limit on auth endpoints (5 attempts per 15 min)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { status: 'error', message: 'Too many attempts, please try again later' },
})

router.post('/register', authLimiter, validate(registerSchema), AuthController.register)
router.post('/login', authLimiter, validate(loginSchema), AuthController.login)
router.post('/refresh', AuthController.refreshToken)
router.post('/logout', authenticate, AuthController.logout)

export default router