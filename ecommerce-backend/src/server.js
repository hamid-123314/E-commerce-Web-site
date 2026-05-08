import app from './app.js'
import { env } from './config/env.js'
import { logger } from './config/logger.js'
import { prisma } from './config/database.js'
import { redis } from './config/redis.js'

const server = app.listen(env.PORT, '0.0.0.0', () => {
  logger.info(`🚀 Server running on port ${env.PORT} [${env.NODE_ENV}]`)
})

// ── Graceful shutdown ─────────────────────────────────────────────────────────
const shutdown = async (signal) => {
    logger.info(`${signal} received, shutting down gracefully...`)
    server.close(async () => {
        await prisma.$disconnect()
        await redis.quit()
        logger.info('All connections closed, Goodbye.')
        precess.exit(0)
    })

    // Force shutdown after 10 seconds
    setTimeout(() => process.exit(1), 10_000)
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection:', reason)
    shutdown('unhandledRejection')
})
