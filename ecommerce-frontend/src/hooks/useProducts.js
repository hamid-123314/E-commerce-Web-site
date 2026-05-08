// hooks/useProducts.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { productService, categoryService } from '@/lib/services.js'
import { getErrorMessage } from '@/lib/api.js'

export const PRODUCT_KEYS = {
  all:    ['products'],
  list:   (params) => ['products', 'list', params],
  detail: (id)     => ['products', 'detail', id],
}

export const useProducts = (params = {}) =>
  useQuery({
    queryKey: PRODUCT_KEYS.list(params),
    queryFn:  () => productService.getAll(params),
  })

export const useProduct = (id) =>
  useQuery({
    queryKey: PRODUCT_KEYS.detail(id),
    queryFn:  () => productService.getById(id),
    enabled:  !!id,
  })

export const useCategories = () =>
  useQuery({
    queryKey: ['categories'],
    queryFn:  categoryService.getAll,
    staleTime: 1000 * 60 * 10, // 10 min
  })

export const useCreateProduct = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: productService.create,
    onSuccess: () => { qc.invalidateQueries(PRODUCT_KEYS.all); toast.success('Product created') },
    onError:   (err) => toast.error(getErrorMessage(err)),
  })
}

export const useUpdateProduct = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => productService.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries(PRODUCT_KEYS.all)
      qc.invalidateQueries(PRODUCT_KEYS.detail(id))
      toast.success('Product updated')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
}

export const useDeleteProduct = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: productService.delete,
    onSuccess: () => { qc.invalidateQueries(PRODUCT_KEYS.all); toast.success('Product deleted') },
    onError:   (err) => toast.error(getErrorMessage(err)),
  })
}
