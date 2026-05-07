// lib/services.js — Toutes les fonctions d'appel API
import { api } from './api.js'

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authService = {
  register:  (data)  => api.post('/auth/register', data).then(r => r.data.data),
  login:     (data)  => api.post('/auth/login', data).then(r => r.data.data),
  logout:    (token) => api.post('/auth/logout', { refreshToken: token }),
  getMe:     ()      => api.get('/auth/me').then(r => r.data.data.user),
}

// ── Products ──────────────────────────────────────────────────────────────────
export const productService = {
  getAll:   (params) => api.get('/products', { params }).then(r => r.data.data),
  getById:  (id)     => api.get(`/products/${id}`).then(r => r.data.data.product),
  create:   (data)   => api.post('/products', data).then(r => r.data.data.product),
  update:   (id, data) => api.patch(`/products/${id}`, data).then(r => r.data.data.product),
  delete:   (id)     => api.delete(`/products/${id}`),
}

// ── Categories ────────────────────────────────────────────────────────────────
export const categoryService = {
  getAll:  () => api.get('/categories').then(r => r.data.data.categories),
  create:  (data) => api.post('/categories', data).then(r => r.data.data.category),
  update:  (id, data) => api.patch(`/categories/${id}`, data).then(r => r.data.data.category),
  delete:  (id) => api.delete(`/categories/${id}`),
}

// ── Cart ──────────────────────────────────────────────────────────────────────
export const cartService = {
  get:          () => api.get('/cart').then(r => r.data.data.cart),
  addItem:      (data) => api.post('/cart/items', data).then(r => r.data.data.cart),
  updateItem:   (productId, quantity) => api.patch(`/cart/items/${productId}`, { quantity }).then(r => r.data.data.cart),
  removeItem:   (productId) => api.delete(`/cart/items/${productId}`),
  clear:        () => api.delete('/cart'),
}

// ── Orders ────────────────────────────────────────────────────────────────────
export const orderService = {
  create:    (items)   => api.post('/orders', { items }).then(r => r.data.data.order),
  getAll:    (params)  => api.get('/orders', { params }).then(r => r.data.data),
  getById:   (id)      => api.get(`/orders/${id}`).then(r => r.data.data.order),
  cancel:    (id)      => api.post(`/orders/${id}/cancel`).then(r => r.data.data.order),
}

// ── Payments ──────────────────────────────────────────────────────────────────
export const paymentService = {
  createCheckout: (orderId) =>
    api.post(`/payments/checkout/${orderId}`).then(r => r.data.data),
}

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminService = {
  getStats:    () => api.get('/admin/stats').then(r => r.data.data),
  getOrders:   (params) => api.get('/admin/orders', { params }).then(r => r.data.data),
  getUsers:    (params) => api.get('/admin/users', { params }).then(r => r.data.data),
  getLowStock: () => api.get('/admin/low-stock').then(r => r.data.data.products),
  refundOrder: (id) => api.post(`/admin/orders/${id}/refund`).then(r => r.data.data.order),
  updateOrderStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }).then(r => r.data.data.order),
}

// ── User ──────────────────────────────────────────────────────────────────────
export const userService = {
  getProfile:      () => api.get('/users/me').then(r => r.data.data.user),
  updateProfile:   (data) => api.patch('/users/me', data).then(r => r.data.data.user),
  changePassword:  (data) => api.patch('/users/me/password', data),
  getMyOrders:     () => api.get('/users/me/orders').then(r => r.data.data.orders),
}
