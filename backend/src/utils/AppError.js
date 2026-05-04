// All intentional errors thrown in the app extend this class.
// The errorHandler middleware checks instanceof AppError to decide
// whether to expose the message to the client or return a generic 500.
export class AppError extends Error {
    constructor(message, statuscode) {
        super(message)
        this.statusCode = statuscode
        this.isOperational = true // Operational = expected error that can be handled gracefully (e.g. invalid input, not found, etc.)
        Error.captureStackTrace(this, this.constructor)
    }
}

// Convenience factory methods
AppError.badRequest  = (msg) => new AppError(msg, 400)
AppError.unauthorized = (msg = 'Unauthorized') => new AppError(msg, 401)
AppError.forbidden   = (msg = 'Forbidden') => new AppError(msg, 403)
AppError.notFound    = (msg = 'Not found') => new AppError(msg, 404)
AppError.conflict    = (msg) => new AppError(msg, 409)
AppError.unprocessable = (msg) => new AppError(msg, 422)
AppError.tooManyRequests = (msg = 'Too many requests') => new AppError(msg, 429)