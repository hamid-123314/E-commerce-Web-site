import { PrismaClient } from '@prisma/client'
import { env } from './env.js'
import { logger } from './logger.js'

// Singleton pattern — prevents multiple connections in development hot-reload
const globalForPrisma = globalThis

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
    log : env.NODE_ENV === 'development' 
    ? [{ emit : 'event', level : 'query' }]
    : ['error'],
})

if (env.NODE_ENV === 'development') {
    prisma.$on('query', (e) => {
        if( e.duration > 200 ) {
            logger.warn(`Slow query (${e.duration}ms): ${e.query}`)
        }
    })
}

if (env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
}
