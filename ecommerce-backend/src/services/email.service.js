import { Resend } from 'resend'
import { env } from '../config/env.js'
import { logger } from '../config/logger.js'

const resend = new Resend(env.RESEND_API_KEY)
const FROM = 'Shop <noreply@yourshop.com>'

export class EmailService {

  // ── Confirmation de commande ────────────────────────────────────────────────
  static async sendOrderConfirmation(order) {
    const itemsHtml = order.items.map(item => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee">${item.product.name}</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">
          ${(Number(item.unitPrice) * item.quantity).toFixed(2)} €
        </td>
      </tr>
    `).join('')

    await EmailService.#send({
      to: order.user.email,
      subject: `Order confirmed #${order.id.slice(-8).toUpperCase()}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#111">Thanks for your order!</h2>
          <p>Hi ${order.user.name}, your order has been confirmed and is being processed.</p>
          <table style="width:100%;border-collapse:collapse;margin:20px 0">
            <thead>
              <tr style="background:#f5f5f5">
                <th style="padding:8px;text-align:left">Product</th>
                <th style="padding:8px;text-align:center">Qty</th>
                <th style="padding:8px;text-align:right">Price</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <p style="font-weight:bold;text-align:right;font-size:18px">
            Total: ${Number(order.total).toFixed(2)} €
          </p>
          <hr style="margin:20px 0">
          <p style="color:#666;font-size:12px">Order ID: ${order.id}</p>
        </div>
      `,
    })
  }

  // ── Notification d'expédition ────────────────────────────────────────────────
  static async sendShippingNotification(order, trackingNumber) {
    await EmailService.#send({
      to: order.user.email,
      subject: `Your order has been shipped! 📦`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#111">Your order is on its way!</h2>
          <p>Hi ${order.user.name},</p>
          <p>Great news! Your order <strong>#${order.id.slice(-8).toUpperCase()}</strong> has been shipped.</p>
          ${trackingNumber ? `<p>Tracking number: <strong>${trackingNumber}</strong></p>` : ''}
          <p style="color:#666;font-size:12px">Order ID: ${order.id}</p>
        </div>
      `,
    })
  }

  // ── Réinitialisation de mot de passe ────────────────────────────────────────
  static async sendPasswordReset(email, resetUrl) {
    await EmailService.#send({
      to: email,
      subject: 'Reset your password',
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <h2>Reset your password</h2>
          <p>Click the button below to reset your password. This link expires in 1 hour.</p>
          <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#111;color:#fff;border-radius:6px;text-decoration:none">
            Reset Password
          </a>
          <p style="color:#999;font-size:12px;margin-top:16px">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `,
    })
  }

  // ── Private send helper ──────────────────────────────────────────────────────
  static async #send({ to, subject, html }) {
    try {
      await resend.emails.send({ from: FROM, to, subject, html })
      logger.info(`Email sent to ${to}: ${subject}`)
    } catch (err) {
      // Ne jamais faire échouer une transaction à cause d'un email
      // Logger l'erreur et continuer
      logger.error(`Failed to send email to ${to}:`, err.message)
    }
  }
}