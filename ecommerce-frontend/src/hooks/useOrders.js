// hooks/useOrders.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { orderService, adminService } from '@/lib/services.js'
import { getErrorMessage } from '@/lib/api.js'

export const useOrders = (params) =>
  useQuery({
    queryKey: ['orders', params],
    queryFn:  () => orderService.getAll(params),
  })

export const useOrder = (id) =>
  useQuery({
    queryKey: ['orders', id],
    queryFn:  () => orderService.getById(id),
    enabled:  !!id,
  })

export const useCancelOrder = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: orderService.cancel,
    onSuccess:  () => { qc.invalidateQueries(['orders']); toast.success('Order cancelled') },
    onError:    (err) => toast.error(getErrorMessage(err)),
  })
}

export const useAdminOrders = (params) =>
  useQuery({
    queryKey: ['admin', 'orders', params],
    queryFn:  () => adminService.getOrders(params),
  })

export const useUpdateOrderStatus = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }) => adminService.updateOrderStatus(id, status),
    onSuccess:  () => { qc.invalidateQueries(['admin', 'orders']); toast.success('Status updated') },
    onError:    (err) => toast.error(getErrorMessage(err)),
  })
}

export const useRefundOrder = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: adminService.refundOrder,
    onSuccess:  () => { qc.invalidateQueries(['admin', 'orders']); toast.success('Order refunded') },
    onError:    (err) => toast.error(getErrorMessage(err)),
  })
}
