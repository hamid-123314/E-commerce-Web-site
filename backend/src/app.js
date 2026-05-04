import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import rateLimit from 'express-rate-limit'

import { env } from './config/env.js'
import { logger } from './config/logger.js'
import { errorHandler } from './middlewares/errorHandler.js'
import { notFound } from './middlewares/notFound.js'
import v1Router from './routes/v1/index.js'

const app = express()

// ── Security ─────────────────────────────────────────────────────────────────
app.use(helmet())
app.use(cors({
    origin: env.CLIENT_URL,
    credentials: true,
}))

// ── Rate limiting ─────────────────────────────────────────────────────────────
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max : 100,
    standardHeaders : true,
    legacyHeaders: false,
})
app.use('/api', limiter)

// ── Body parsing ──────────────────────────────────────────────────────────────
// Raw body for Stripe webhook signature verification (must come before json())
app.use('/api/v1/payments/webhook', express.raw({type: 'application/json'}))
app.use(express.json({ limit : '10kb'}))
app.use(express.urlencoded({ extended : true }))
app.use(compression())

// ── Logging ───────────────────────────────────────────────────────────────────
const morganFormat = env.NODE_ENV === 'production' ? 'combined' : 'dev' 
app.use(morgan(morganFormat, {
    stream: { write : (msg) => logger.http(msg.trim()) },
    skip: () => env.NODE_ENV === 'test',
}))

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (req,res) => {
    res.status(200).json({
        status: 'ok',
        environment : env.NODE_ENV,
        timestamp: new Date().toISOString(),
    })
})

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/v1', v1Router)

// ── Error handling (must be last) ─────────────────────────────────────────────
app.use(notFound)
app.use(errorHandler)

export default app