import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { AppError } from '../utils/AppError.js'
import { prisma } from '../config/database.js'

// Verifies JWT and attaches req.user
export const authenticate = async (req, res, next) => {
    try{
        const authHeader = req.headers.authorization
        if(!authHeader?.startWith('Bearer ')){
            throw AppError.unauthorized('No token provided')
        }

        const token = authHeader.split(' ')[1]
        const payload = jwt.verify(token, env.JWT_SECRET)

        // Optional: re-check user still exists (catches deleted accounts)
        const user = await prisma.user.findUnique({
            where: { id: payload.sub },
            select: { id: true, email: true, role: true }
        })

        if(!user) throw AppError.unauthorized('User no longer exists')

        req.user = user
        next()

    } catch(err) {
        if( err instanceof jwt.JsonWebTokenError) {
            return AppError.unauthorized('Invalid token')
        }
        if( err instanceof jwt.TokenExpiredError) {
            return AppError.unauthorized('Token expired')
        }
        next(err)
    }
}

// Role-based access control — use after authenticate
// Usage: router.delete('/products/:id', authenticate, authorize('admin'), handler)
export const authorize = (...roles) => (req, res, next) => {
    if(!roles.includes(req.user?.role)){
        return next(AppError.forbidden('Insufficient permissions'))
    }
    next()
}
