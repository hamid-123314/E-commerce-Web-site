// components/layout/Footer.jsx
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-ink-900 text-ink-200 mt-20">
      <div className="page-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="font-display text-2xl text-white mb-3">SHOP<span className="text-amber">.</span></div>
            <p className="text-sm text-ink-400 leading-relaxed max-w-xs">
              Curated collections for those who appreciate quality and timeless design.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-medium uppercase tracking-widest text-ink-400 mb-4">Navigation</h4>
            <div className="flex flex-col gap-2">
              {[['/', 'Home'], ['/products', 'Collection'], ['/cart', 'Cart']].map(([to, label]) => (
                <Link key={to} to={to} className="text-sm text-ink-300 hover:text-white transition-colors">{label}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-medium uppercase tracking-widest text-ink-400 mb-4">Account</h4>
            <div className="flex flex-col gap-2">
              {[['/login', 'Sign In'], ['/register', 'Create Account'], ['/orders', 'My Orders']].map(([to, label]) => (
                <Link key={to} to={to} className="text-sm text-ink-300 hover:text-white transition-colors">{label}</Link>
              ))}
            </div>
          </div>
        </div>
        <div className="divider border-ink-700 mt-10 pt-6 flex items-center justify-between">
          <p className="text-xs text-ink-500">© {new Date().getFullYear()} Shop. All rights reserved.</p>
          <p className="text-xs text-ink-600 font-mono">Built with React + Node.js</p>
        </div>
      </div>
    </footer>
  )
}
