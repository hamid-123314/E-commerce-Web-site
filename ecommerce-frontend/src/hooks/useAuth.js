// hooks/useAuth.js — Hook auth avec React Query
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authService } from '@/lib/services.js'
import { useAuthStore } from '@/store/auth.store.js'
import { getErrorMessage } from '@/lib/api.js'

export const useAuth = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { setAuth, logout: storeLogout, isAuthenticated, user } = useAuthStore()

  const register = useMutation({
    mutationFn: authService.register,
    onSuccess: ({ user, accessToken, refreshToken }) => {
      setAuth(user, accessToken, refreshToken)
      toast.success(`Welcome, ${user.name}!`)
      navigate('/')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const login = useMutation({
    mutationFn: authService.login,
    onSuccess: ({ user, accessToken, refreshToken }) => {
      setAuth(user, accessToken, refreshToken)
      toast.success('Welcome back!')
      navigate('/')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const logout = useMutation({
    mutationFn: () => authService.logout(useAuthStore.getState().refreshToken),
    onSettled: () => {
      storeLogout()
      queryClient.clear()
      navigate('/login')
    },
  })

  return { register, login, logout, isAuthenticated, user }
}
