import axios from 'axios'
import { useAuthStore } from '@/store/auth.store.js'

// ── Direct call to backend — bypasses Vite proxy entirely ────────────────────
// Vite proxy has IPv6/IPv4 issues on Windows — calling backend directly fixes it
export const api = axios.create({
  baseURL: 'http://localhost:4000/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
  withCredentials: false,
})

// Add a request interceptor to handle session IDs if you use them
api.interceptors.request.use((config) => {
  const sessionId = localStorage.getItem('sessionId');
  if (sessionId) {
    config.headers['x-session-id'] = sessionId;
  }
  return config;
});

// ── DEBUG logs ────────────────────────────────────────────────────────────────
if (import.meta.env.DEV) {
  api.interceptors.request.use((config) => {
    console.log(`[API] → ${config.method?.toUpperCase()} ${config.url}`, config.data ?? '')
    return config
  })
}

// ── Request interceptor : inject token + session ──────────────────────────────
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`

  const sessionId = localStorage.getItem('sessionId')
  if (sessionId) config.headers['x-session-id'] = sessionId

  return config
})

// ── Response interceptor : auto refresh on 401 ───────────────────────────────
let isRefreshing = false
let failedQueue  = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    error ? reject(error) : resolve(token)
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`[API] ← ${response.status} ${response.config.url}`)
    }
    return response
  },
  async (error) => {
    if (import.meta.env.DEV) {
      console.error(
        `[API] ✗ ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
        '\nStatus:', error.response?.status,
        '\nMessage:', error.response?.data?.message ?? error.message,
      )
    }

    const original = error.config

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true

      if (isRefreshing) {
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
        const { data } = await axios.post(
          'http://127.0.0.1:4000/api/v1/auth/refresh',
          { refreshToken }
        )
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

export const getErrorMessage = (error) =>
  error?.response?.data?.message ?? error?.message ?? 'Something went wrong'
