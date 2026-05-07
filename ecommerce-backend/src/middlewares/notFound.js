import { AppError } from '../utils/AppError.js'

export const notFound = (req, res, next) => {
    next(AppError.notFound(`Route not found: ${req.method} ${req.originalUrl}`))
}