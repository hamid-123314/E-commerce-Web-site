import { Prisma } from '@prisma/client'
import { ZodError } from 'zod'
import { AppError } from '../utils/AppError.js'
import { logger } from '../config/logger.js'
import { env } from '../config/env.js'

// Central error handler — catches everything thrown in routes/services
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {

      // ── Zod validation errors ───────────────────────────────────────────────────
    if (err instanceof ZodError) {
        return res.status(400).json({
            status: 'error',
            message: 'Validation failed',
            errors: err.flatten().fieldErrors,
        })
    }


    // ── Prisma known errors ─────────────────────────────────────────────────────
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
            const field = err.meta?.target?.[0] ?? 'field'
            return res.status(409).json({
                status: 'error',
                message: `${field} already exists`
            })
        }
        if (err.code === 'P2025') {
            return res.status(404).json({
                status: 'error',
                message: 'Record not found'
            })
        }
    }

      // ── Operational errors (AppError) ─────────────────────────────────────────
    if (err instanceof AppError && err.isOperational) {
        return res.status(err.statusCode).json({
            status: 'error',
            message: err.message,
        })
    }

    // ── Unknown / programmer errors ────────────────────────────────────────────
    // Log full stack, never expose internals to client
    logger.error('Unexpected error:',  {
        message: err.message,
        stack: err.stack,
        url: req.url
    })

    return res.status(500).json({
        status: 'error',
        message: env.NODE_ENV === 'production' ? 'Something went wromg' : err.message,
        ...(env.NODE_ENV !== 'production' &&  {stack: err.stack}  )
    })
}