import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import pg from 'pg'
import { env } from './env.js'
import { logger } from './logger.js'

// 1. Create a standard Postgres Connection Pool
const pool = new pg.Pool({ connectionString: env.DATABASE_URL })

// 2. Pass the pool into the Prisma Adapter
const adapter = new PrismaPg(pool)

// Singleton pattern — prevents multiple connections in dev hot-reload
const globalForPrisma = globalThis

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  adapter,
  log: env.NODE_ENV === 'development'
    ? [{ emit: 'event', level: 'query' }]
    : ['error'],
})

// Log slow queries in development
if (env.NODE_ENV === 'development') {
  prisma.$on('query', (e) => {
    if (e.duration > 200) {
      logger.warn(`Slow query (${e.duration}ms): ${e.query}`)
    }
  })
}

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
