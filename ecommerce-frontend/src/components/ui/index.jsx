// components/ui/index.jsx — Composants UI réutilisables
import { cn } from '@/lib/utils.js'
import { Loader2 } from 'lucide-react'

// ── Button ────────────────────────────────────────────────────────────────────
export const Button = ({ variant = 'primary', size = 'md', loading, children, className, ...props }) => {
  const variants = {
    primary:   'btn-primary',
    secondary: 'btn-secondary',
    ghost:     'btn-ghost',
    danger:    'inline-flex items-center justify-center gap-2 px-6 py-3 bg-rose text-white font-medium text-sm transition-all hover:bg-rose-dark active:scale-95 disabled:opacity-40',
  }
  const sizes = { sm: 'px-4 py-2 text-xs', md: '', lg: 'px-8 py-4 text-base' }

  return (
    <button {...props} disabled={loading || props.disabled}
      className={cn(variants[variant], sizes[size], className)}>
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  )
}

// ── Input ─────────────────────────────────────────────────────────────────────
export const Input = ({ label, error, className, ...props }) => (
  <div className="w-full">
    {label && <label className="label">{label}</label>}
    <input {...props} className={cn('input', error && 'border-rose', className)} />
    {error && <p className="mt-1 text-xs text-rose">{error}</p>}
  </div>
)

// ── Select ────────────────────────────────────────────────────────────────────
export const Select = ({ label, error, children, className, ...props }) => (
  <div className="w-full">
    {label && <label className="label">{label}</label>}
    <select {...props} className={cn('input appearance-none', error && 'border-rose', className)}>
      {children}
    </select>
    {error && <p className="mt-1 text-xs text-rose">{error}</p>}
  </div>
)

// ── Badge ─────────────────────────────────────────────────────────────────────
export const Badge = ({ children, className }) => (
  <span className={cn('badge', className)}>{children}</span>
)

// ── Spinner ───────────────────────────────────────────────────────────────────
export const Spinner = ({ size = 20, className }) => (
  <Loader2 size={size} className={cn('animate-spin text-ink-400', className)} />
)

// ── Loading page ──────────────────────────────────────────────────────────────
export const PageLoading = () => (
  <div className="flex items-center justify-center min-h-[40vh]">
    <Spinner size={28} />
  </div>
)

// ── Empty state ───────────────────────────────────────────────────────────────
export const Empty = ({ icon: Icon, title, desc, action }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    {Icon && <Icon size={40} className="text-ink-200 mb-4" />}
    <h3 className="font-display text-xl text-ink-700 mb-2">{title}</h3>
    {desc && <p className="text-sm text-ink-400 mb-6">{desc}</p>}
    {action}
  </div>
)

// ── Card ──────────────────────────────────────────────────────────────────────
export const Card = ({ children, className, ...props }) => (
  <div {...props} className={cn('card p-6', className)}>{children}</div>
)

// ── Error message ─────────────────────────────────────────────────────────────
export const ErrorMessage = ({ message }) => (
  <div className="p-4 bg-rose-light border border-rose text-rose-dark text-sm">
    {message ?? 'An error occurred. Please try again.'}
  </div>
)

// ── Divider ───────────────────────────────────────────────────────────────────
export const Divider = ({ className }) => <div className={cn('divider', className)} />
