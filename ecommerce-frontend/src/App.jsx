import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store.js'

// Layout
import RootLayout   from '@/components/layout/RootLayout.jsx'
import AdminLayout  from '@/components/layout/AdminLayout.jsx'

// Pages — Public
import HomePage         from '@/pages/HomePage.jsx'
import ProductsPage     from '@/pages/products/ProductsPage.jsx'
import ProductDetailPage from '@/pages/products/ProductDetailPage.jsx'
import CartPage         from '@/pages/cart/CartPage.jsx'

// Pages — Auth
import LoginPage    from '@/pages/auth/LoginPage.jsx'
import RegisterPage from '@/pages/auth/RegisterPage.jsx'

// Pages — Protected
import ProfilePage  from '@/pages/ProfilePage.jsx'
import OrdersPage   from '@/pages/orders/OrdersPage.jsx'
import OrderDetailPage from '@/pages/orders/OrderDetailPage.jsx'
import CheckoutSuccessPage from '@/pages/cart/CheckoutSuccessPage.jsx'

// Pages — Admin
import AdminDashboard from '@/pages/admin/AdminDashboard.jsx'
import AdminProducts  from '@/pages/admin/AdminProducts.jsx'
import AdminOrders    from '@/pages/admin/AdminOrders.jsx'
import AdminUsers     from '@/pages/admin/AdminUsers.jsx'

// Guards
const PrivateRoute = ({ children }) => {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

const AdminRoute = ({ children }) => {
  const user = useAuthStore(s => s.user)
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/" replace />
  return children
}

const GuestRoute = ({ children }) => {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  return isAuthenticated ? <Navigate to="/" replace /> : children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public routes ── */}
        <Route element={<RootLayout />}>
          <Route index element={<HomePage />} />
          <Route path="products"    element={<ProductsPage />} />
          <Route path="products/:id" element={<ProductDetailPage />} />
          <Route path="cart"        element={<CartPage />} />

          {/* ── Guest only ── */}
          <Route path="login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

          {/* ── Authenticated ── */}
          <Route path="profile"  element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          <Route path="orders"   element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
          <Route path="orders/:id" element={<PrivateRoute><OrderDetailPage /></PrivateRoute>} />
          <Route path="checkout/success" element={<PrivateRoute><CheckoutSuccessPage /></PrivateRoute>} />
        </Route>

        {/* ── Admin ── */}
        <Route path="admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index             element={<AdminDashboard />} />
          <Route path="products"   element={<AdminProducts />} />
          <Route path="orders"     element={<AdminOrders />} />
          <Route path="users"      element={<AdminUsers />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
