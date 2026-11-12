import { Link } from 'react-router-dom'

const VARIANTS = {
  primary: 'bg-lime-400 text-navy-900 hover:brightness-95',
  secondary: 'bg-surface text-navy-700 ring-[1.5px] ring-inset ring-line hover:bg-bg-soft',
  dark: 'bg-navy-700 text-on-dark hover:bg-navy-900',
  ghost: 'bg-transparent text-navy-500 hover:bg-bg-soft',
  danger: 'bg-surface text-danger ring-[1.5px] ring-inset ring-line hover:bg-tint-coral',
}

const SIZES = {
  md: 'h-12 px-6 text-sm gap-2',
  sm: 'h-9 px-4 text-[13px] gap-1.5',
}

// Tombol pill sesuai komponen Button di Figma (Primary, Secondary, Dark).
// Pakai `to` untuk tautan internal, `href` untuk tautan luar.
export default function Button({
  variant = 'primary',
  size = 'md',
  full = false,
  loading = false,
  disabled = false,
  to,
  href,
  icon,
  className = '',
  children,
  ...rest
}) {
  const cls = [
    'inline-flex items-center justify-center rounded-full font-semibold whitespace-nowrap',
    'transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
    VARIANTS[variant],
    SIZES[size],
    // Tombol lebar penuh boleh menyusut supaya dua tombol bisa berbagi satu baris
    full ? 'w-full min-w-0' : 'shrink-0',
    className,
  ].join(' ')

  const content = (
    <>
      {loading ? <Spinner /> : icon}
      <span>{children}</span>
    </>
  )

  if (to) return <Link to={to} className={cls} {...rest}>{content}</Link>
  if (href) return <a href={href} className={cls} target="_blank" rel="noopener noreferrer" {...rest}>{content}</a>
  return (
    <button type="button" className={cls} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {content}
    </button>
  )
}

export function Spinner({ className = 'size-4' }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

// Tombol bulat kecil untuk ikon (kembali, wishlist, plus/minus)
export function IconButton({ label, className = 'size-10 bg-surface shadow-card', children, ...rest }) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`inline-flex shrink-0 items-center justify-center rounded-full text-ink transition active:scale-95 ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
