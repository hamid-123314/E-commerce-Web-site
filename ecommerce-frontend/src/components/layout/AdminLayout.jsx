// components/layout/AdminLayout.jsx
import { Outlet, NavLink, Link } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingBag, Users, ArrowLeft, AlertTriangle } from 'lucide-react'

const links = [
  { to: '/admin',          label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products',  icon: Package },
  { to: '/admin/orders',   label: 'Orders',    icon: ShoppingBag },
  { to: '/admin/users',    label: 'Users',     icon: Users },
]

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-ink-50">
      {/* Sidebar */}
      <aside className="w-56 bg-ink-900 text-white flex flex-col">
        <div className="px-6 py-5 border-b border-ink-700">
          <div className="font-display text-lg text-white">SHOP<span className="text-amber">.</span></div>
          <div className="text-xs text-ink-400 mt-0.5 font-mono uppercase tracking-wider">Admin Panel</div>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 text-sm transition-colors rounded-none
                ${isActive ? 'bg-amber text-white' : 'text-ink-300 hover:bg-ink-700 hover:text-white'}`
              }>
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-ink-700">
          <Link to="/" className="flex items-center gap-2 text-xs text-ink-400 hover:text-white transition-colors">
            <ArrowLeft size={13} /> Back to store
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="p-8 animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
