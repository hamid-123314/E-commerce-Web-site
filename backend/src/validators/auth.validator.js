import { z } from 'zod'

export const registerSchema = z.object({
    name: 
        z.string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name too long'),
    email: 
        z.string()
        .email('Invalid email address')
        .toLowerCase(),
    password: 
        z.string()
        .min(8, 'Password must be at least 8 characters')
        .max(72, 'Password too long')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
})

export const loginSchema = z.object({
    email: z.string().email().toLowerCase(),
    password: z.string().min(1, 'Password is required'),
})

export const refreshSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
})