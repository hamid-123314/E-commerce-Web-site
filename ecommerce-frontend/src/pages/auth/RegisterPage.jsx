// pages/auth/RegisterPage.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth.js'
import { Input, Button } from '@/components/ui/index.jsx'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const { register } = useAuth()
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="text-center mb-10">
          <div className="font-mono text-xs text-ink-400 uppercase tracking-widest mb-2">Get started</div>
          <h1 className="section-title text-3xl">Create Account</h1>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); register.mutate(form) }} className="space-y-5">
          <Input label="Full Name" value={form.name} onChange={set('name')}
            placeholder="Alice Martin" required />
          <Input label="Email" type="email" value={form.email} onChange={set('email')}
            placeholder="you@example.com" required />
          <Input label="Password" type="password" value={form.password} onChange={set('password')}
            placeholder="Min. 8 chars, 1 uppercase, 1 number" required />

          <Button type="submit" loading={register.isPending} className="w-full justify-center py-4 mt-2">
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-ink-400 mt-8">
          Already have an account?{' '}
          <Link to="/login" className="text-ink-900 underline hover:text-amber-dark transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
