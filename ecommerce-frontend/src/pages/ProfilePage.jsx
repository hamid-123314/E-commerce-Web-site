// pages/ProfilePage.jsx
import { useAuthStore } from '@/store/auth.store.js'
import { formatDate } from '@/lib/utils.js'
import { Card } from '@/components/ui/index.jsx'
import { User, Mail, Calendar, Package } from 'lucide-react'

export default function ProfilePage() {
  const user = useAuthStore(s => s.user)

  return (
    <div className="page-container py-12 max-w-2xl">
      <div className="mb-10">
        <div className="font-mono text-xs text-ink-400 uppercase tracking-widest mb-2">Account</div>
        <h1 className="section-title">My Profile</h1>
      </div>

      <Card>
        <div className="flex items-center gap-5 mb-8">
          <div className="w-14 h-14 bg-ink-900 flex items-center justify-center text-white font-display text-xl">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <div className="font-display text-xl font-semibold text-ink-900">{user?.name}</div>
            <div className="text-sm text-ink-400 font-mono uppercase tracking-wider">{user?.role}</div>
          </div>
        </div>

        <div className="grid gap-4">
          {[
            { icon: User,     label: 'Full Name', value: user?.name },
            { icon: Mail,     label: 'Email',     value: user?.email },
            { icon: Calendar, label: 'Member since', value: user?.createdAt ? formatDate(user.createdAt) : '' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-4 py-3 border-b border-ink-100 last:border-0">
              <Icon size={16} className="text-ink-400 flex-shrink-0" />
              <div>
                <div className="text-xs text-ink-400 uppercase tracking-wider font-mono mb-0.5">{label}</div>
                <div className="text-sm font-medium text-ink-900">{value}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
