// pages/auth/LoginPage.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth.js'
import { Input, Button } from '@/components/ui/index.jsx'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const { login } = useAuth()
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="text-center mb-10">
          <div className="font-mono text-xs text-ink-400 uppercase tracking-widest mb-2">Welcome back</div>
          <h1 className="section-title text-3xl">Sign In</h1>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); login.mutate(form) }} className="space-y-5">
          <Input label="Email" type="email" value={form.email} onChange={set('email')}
            placeholder="you@example.com" required autoComplete="email" />
          <Input label="Password" type="password" value={form.password} onChange={set('password')}
            placeholder="••••••••" required autoComplete="current-password" />

          <Button type="submit" loading={login.isPending} className="w-full justify-center py-4 mt-2">
            Sign In
          </Button>
        </form>

        <p className="text-center text-sm text-ink-400 mt-8">
          Don't have an account?{' '}
          <Link to="/register" className="text-ink-900 underline hover:text-amber-dark transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
