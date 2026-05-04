import { createClient } from 'redis'
import { env } from './env.js'
import { logger } from './logger.js'

export const redis = createClient({ url : env.Redis_URL})

redis.on('error', (err) => logger.error('Redis Client Error', err))
redis.on('connect', () => logger.info('Connected to Redis'))

await redis.connect()

// ── Helper wrappers ───────────────────────────────────────────────────────────
export const cache = {
    async get(key) {
        const val = await redis.get(key)
        return val ? JSON.parse(val) : null
    },

    async set(key, value, ttlseconds = 300) {
        await redis.set(key, JSON.stringify(value), { EX: ttlseconds })
    },

    async del(key) {
        await redis.del(key)
    }, 

    // delete all keys matching a pattern (e.g. 'product:*')
    async delPattern(pattern) {
        const keys = await redis.keys(pattern)
        if (keys.length > 0) { await redis.del(keys) }
    },
} 