import winston from 'winston'
import { env } from './env.js'

const { combine, timestamp, printf, colorize, json } = winston.format

const devFromat = combine(
    colorize(),
    timestamp( { format : 'HH:mm:ss'}),
    printf(({ level, message, timestamp, ...meta }) => {
        const extra = Object.keys(meta).length ? JSON.stringify(meta) : ''
        return `[${timestamp}] ${level}: ${message} ${extra}`
    })
)

const prodFormat = combine(
    timestamp(),
    json()
)

export const logger = winston.createLogger({
    level : env.NODE_ENV === 'production' ? 'info' : 'debug',
    format : env.NODE_ENV === 'production' ? prodFormat : devFromat,
    transports : [
        new winston.transports.Console(),
        ...(env.NODE_ENV === 'production' ? [
            new winston.transports.File({ filename : 'logs/error.log', level : 'error' }),
            new winston.transports.File({ filename : 'logs/combined.log' }),
        ] : []),
    ],
    silent : env.NODE_ENV === 'test',
})