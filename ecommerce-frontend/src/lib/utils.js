// lib/utils.js — Helpers réutilisables
import { clsx } from 'clsx'

// Combine classes Tailwind conditionnellement
export const cn = (...inputs) => clsx(inputs)

// Formatage prix
export const formatPrice = (price) =>
  new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(Number(price))

// Formatage date
export const formatDate = (date) =>
  new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(date))

// Formatage date relative
export const formatRelativeDate = (date) => {
  const diff = Date.now() - new Date(date).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return "Today"
  if (days === 1) return "Yesterday"
  if (days < 7)  return `${days} days ago`
  return formatDate(date)
}

// Tronquer le texte
export const truncate = (str, n = 80) =>
  str?.length > n ? str.slice(0, n) + '…' : str

// Couleur badge statut commande
export const orderStatusColor = (status) => ({
  pending:   'bg-amber-light text-amber-dark',
  paid:      'bg-sage-light text-sage-dark',
  shipped:   'bg-blue-100 text-blue-800',
  delivered: 'bg-sage-light text-sage-dark',
  cancelled: 'bg-rose-light text-rose-dark',
  refunded:  'bg-ink-100 text-ink-500',
}[status] ?? 'bg-ink-100 text-ink-500')

// Label statut commande en français
export const orderStatusLabel = (status) => ({
  pending:   'En attente',
  paid:      'Payée',
  shipped:   'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
  refunded:  'Remboursée',
}[status] ?? status)

// ID court pour affichage
export const shortId = (id) => id?.slice(-8).toUpperCase()
