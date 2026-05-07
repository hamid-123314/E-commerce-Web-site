// store/auth.store.js — État global authentification (Zustand)
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user:         null,
      accessToken:  null,
      refreshToken: null,
      isAuthenticated: false,

      // Appelé après login / register
      setAuth: (user, accessToken, refreshToken) => set({
        user, accessToken, refreshToken, isAuthenticated: true,
      }),

      // Appelé après refresh token
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),

      // Update profil local
      setUser: (user) => set({ user }),

      // Logout — reset complet
      logout: () => set({
        user: null, accessToken: null, refreshToken: null, isAuthenticated: false,
      }),
    }),
    {
      name: 'auth-storage',
      // Ne persister que les tokens et user — pas les fonctions
      partialize: (state) => ({
        user:         state.user,
        accessToken:  state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
