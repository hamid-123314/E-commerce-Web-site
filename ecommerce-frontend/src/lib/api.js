// lib/api.js — Axios instance avec intercepteurs JWT + refresh automatique
import axios from 'axios'
import { useAuthStore } from '@/store/auth.store.js'

export const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// ── Request interceptor : injecte le token dans chaque requête ────────────────
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`

  // Panier invité — session ID depuis localStorage
  const sessionId = localStorage.getItem('sessionId')
  if (sessionId) config.headers['x-session-id'] = sessionId

  return config
})

// ── Response interceptor : refresh automatique si 401 ─────────────────────────
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token)
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true

      if (isRefreshing) {
        // File d'attente — toutes les requêtes attendent le nouveau token
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          original.headers.Authorization = `Bearer ${token}`
          return api(original)
        })
      }

      isRefreshing = true
      const { refreshToken, setTokens, logout } = useAuthStore.getState()

      try {
        const { data } = await axios.post('/api/v1/auth/refresh', { refreshToken })
        const { accessToken, refreshToken: newRefresh } = data.data
        setTokens(accessToken, newRefresh)
        processQueue(null, accessToken)
        original.headers.Authorization = `Bearer ${accessToken}`
        return api(original)
      } catch (refreshError) {
        processQueue(refreshError, null)
        logout()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

// ── Helper pour extraire le message d'erreur ──────────────────────────────────
export const getErrorMessage = (error) =>
  error?.response?.data?.message ?? error?.message ?? 'Something went wrong'
