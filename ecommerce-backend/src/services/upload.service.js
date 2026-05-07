import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomUUID } from 'crypto'
import { env } from '../config/env.js'
import { AppError } from '../utils/AppError.js'

const s3 = new S3Client({
    region: env.AWS_REGION,
    credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
})

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

export class UploadService {

    /**
     * Génère une presigned URL pour upload direct vers S3.
     * Le frontend reçoit cette URL et upload l'image en PUT directement.
     * @param {string} contentType - MIME type (ex: 'image/jpeg')
     * @param {number} contentLength - taille du fichier en octets
     * @returns {{ uploadUrl: string, publicUrl: string, key: string }}
     */
    static async getPresignedUploadUrl(contentType, contentLength) {
        if (!ALLOWED_TYPES.includes(contentType)) {
        throw AppError.badRequest(`File type not allowed. Allowed: ${ALLOWED_TYPES.join(', ')}`)
        }
        if (contentLength > MAX_SIZE_BYTES) {
        throw AppError.badRequest('File too large. Maximum size is 5MB')
        }

        const ext = contentType.split('/')[1]
        const key = `products/${randomUUID()}.${ext}`

        const command = new PutObjectCommand({
        Bucket: env.S3_BUCKET_NAME,
        Key: key,
        ContentType: contentType,
        ContentLength: contentLength,
        })

        // URL valide 5 minutes — le frontend doit uploader dans ce délai
        const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 })
        const publicUrl = `https://${env.S3_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${key}`

        return { uploadUrl, publicUrl, key }
    }

    /**
     * Supprime une image S3 lors de la suppression d'un produit.
     * @param {string} imageUrl - URL publique de l'image S3
     */
    static async deleteImage(imageUrl) {
        try {
        const url = new URL(imageUrl)
        const key = url.pathname.slice(1) // supprime le '/' initial

        await s3.send(new DeleteObjectCommand({
            Bucket: env.S3_BUCKET_NAME,
            Key: key,
        }))
        } catch {
        // Ne pas bloquer si la suppression S3 échoue — juste logger
        }
    }
}