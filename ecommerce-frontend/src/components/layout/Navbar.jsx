// components/layout/Navbar.jsx
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ShoppingBag, User, Menu, X, LogOut, LayoutDashboard } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '@/store/auth.store.js'
import { useCartStore } from '@/store/cart.store.js'
import { useAuth } from '@/hooks/useAuth.js'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { isAuthenticated, user } = useAuthStore()
  const cartItems = useCartStore(s => s.items)
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0)
  const { logout } = useAuth()

  const navLinks = [
    { to: '/products', label: 'Collection' },
  ]

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-ink-100">
      <div className="page-container">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="font-display text-xl font-semibold text-ink-900 tracking-tight">
            SHOP<span className="text-amber">.</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(l => (
              <NavLink key={l.to} to={l.to}
                className={({ isActive }) =>
                  `text-sm font-medium tracking-wide transition-colors ${isActive ? 'text-ink-900' : 'text-ink-400 hover:text-ink-900'}`
                }>
                {l.label}
              </NavLink>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Cart */}
            <Link to="/cart" className="relative p-2.5 text-ink-600 hover:text-ink-900 transition-colors">
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-ink-900 text-white text-[10px] font-mono flex items-center justify-center rounded-full">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* Auth */}
            {isAuthenticated ? (
              <div className="relative group ml-1">
                <button className="flex items-center gap-2 p-2 text-ink-600 hover:text-ink-900 transition-colors">
                  <User size={20} />
                  <span className="hidden md:block text-sm font-medium">{user?.name?.split(' ')[0]}</span>
                </button>
                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-ink-100 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-sm text-ink-700 hover:bg-ink-50 transition-colors">
                    <User size={15} /> My Profile
                  </Link>
                  <Link to="/orders" className="flex items-center gap-3 px-4 py-3 text-sm text-ink-700 hover:bg-ink-50 transition-colors">
                    <ShoppingBag size={15} /> My Orders
                  </Link>
                  {user?.role === 'admin' && (
                    <Link to="/admin" className="flex items-center gap-3 px-4 py-3 text-sm text-amber-dark hover:bg-amber-light transition-colors">
                      <LayoutDashboard size={15} /> Admin Panel
                    </Link>
                  )}
                  <div className="divider" />
                  <button onClick={() => logout.mutate()} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-rose hover:bg-rose-light transition-colors">
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="ml-1 btn-primary text-xs px-4 py-2">
                Sign In
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button className="md:hidden p-2 ml-1 text-ink-600" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-ink-100 py-4 animate-slide-up">
            {navLinks.map(l => (
              <NavLink key={l.to} to={l.to} onClick={() => setMobileOpen(false)}
                className="block py-3 text-sm font-medium text-ink-700 hover:text-ink-900">
                {l.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    </header>
  )
}
