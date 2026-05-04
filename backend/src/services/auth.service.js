import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { redis } from '../config/redis.js'
import { prisma } from '../config/database.js'
import { AppError } from '../utils/AppError.js'

const BCRYPT_ROUNDS = 12
const REFRESH_PREFIX = 'refresh:'  // Redis key prefix for refresh tokens


export class AuthService {

    static async register ({ name, email, password }){
        const exists = await  prisma.user.findUnique({ where : { email}})
        if ( exists ) throw AppError.conflict('Email already in use')
        
        const hashed = await bcrypt.hash(password, BCRYPT_ROUNDS)
        const user = await prisma.user.create({
            data: { name, email, password: hashed },
            select: { id: true, name: true, email: true , role: true , createdAt: true }
        })
        const tokens = AuthService.#generateTokens(user) 
        await AuthService.#storeRefreshToken(user.id, tokens.refreshToken)
        return { user, ...tokens }
    }

    static async login ({ email, password }) {
        const user = await prisma.user.findunique({ where: { email } })
        if ( !user ) throw AppError.unauthorized('Invalid credentials')

        const valid = await bcrypt.compare(password, user.password)
        if ( !valid ) throw AppError.unauthorized('Invalid credentials')

        const { password: _ , ...safeUser } = user
        const tokens = AuthService.#generateTokens(safeUser)
        await AuthService.#storeRefreshToken(user.id, tokens.refreshToken)
        return { user: safeUser, ...tokens }
    }

    static async refreshToken (refreshToken) {
        if( !refreshToken ) throw AppError.unauthorized("Refresh token required")
        
        let payload
        try {
            payload = jwt.verify(refreshToken, env.REFRESH_SECRET) 
        } catch {
            throw AppError.unauthorized('Invalid or expired refresh token')
        }

        // Check token exists in Redis (not revoked)
        const stored = redis.get(`${REFRESH_PREFIX}${payload.sub}:${refreshToken}`)
        if( !stored ) throw AppError.unauthorized("Refresh token revoked")

        // Rotate: delete old, issue new pair
        await redis.del(`${REFRESH_PREFIX}${payload.sub}:${refreshToken}`)

        const user = prisma.user.findUnique({ 
            where: { id: payload.sub },
            select: { id: true, email: true, role: true}
        })
        if( !user ) throw AppError.unauthorized("User not found")

        const tokens = AuthService.#generateTokens(user)
        await AuthService.#storeRefreshToken(user.id, tokens.refreshToken)
        return tokens 
    }

    static async logout(userId, refreshToken) {
        if(refreshToken) {
            await redis.del(`${REFRESH_PREFIX}${userId}:${refreshToken}`)
        }
    }


    // ── Private helpers ─────────────────────────────────────────────────────────
    static #generateTokens(user) {
        const accessToken = jwt.sign(
            { sub: user.id, role: user.role },
            env.JWT_SECRET,
            { expiresIn: env.JWT_EXPIRES_IN }
        )

        const refreshToken = jwt.sign(
            { sub: user.id },
            env.REFRESH_SECRET,
            { expiresIn: env.REFRESH_EXPIRES_IN }
        )
        return { accessToken, refreshToken }
    }

    static async #storeRefreshToken(userId, refreshToken) {
        const sevenDays = 7 * 24 * 60 * 60 
        await redis.set(
            `${REFRESH_PREFIX}${userId}:${refreshToken}`,
            '1',
            {'EX': sevenDays}
        )
    }
}