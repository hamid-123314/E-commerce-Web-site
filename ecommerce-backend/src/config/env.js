import { z } from 'zod'
import dotenv from 'dotenv'

dotenv.config()

// All env vars validated at startup — app crashes immediately if anything is missing
const envSchema  = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(4000),

    // Database
    DATABASE_URL: z.string().url(),

    // Redis
    REDIS_URL: z.string().url(),

    // Auth
    JWT_SECRET: z.string().min(32),
    JWT_EXPIRES_IN: z.string().default('15m'),
    REFRESH_SECRET: z.string().min(32),
    REFRESH_EXPIRES_IN: z.string().default('7d'),

    // CLient
    CLIENT_URL: z.string().url(),

    // Stripe
    STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
    STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),

    // AWS S3
    AWS_REGION:             z.string(),
    AWS_ACCESS_KEY_ID:      z.string(),
    AWS_SECRET_ACCESS_KEY:  z.string(),
    S3_BUCKET_NAME:         z.string(),

    // Email
    RESEND_API_KEY: z.string().optional(),
})

const parsed = envSchema.safeParse(process.env)

if(!parsed.success){
    console.error('❌ Invalid environment variables:')
    console.error(parsed.error.flatten().fieldErrors)
    process.exit(1)
}

export const env = parsed.data