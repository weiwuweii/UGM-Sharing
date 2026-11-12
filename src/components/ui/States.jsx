import Buddy from '../buddy/Buddy'
import Button from './Button'

// Kerangka abu-abu saat data dimuat
export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-field bg-bg-soft ${className}`} aria-hidden="true" />
}

// Keadaan kosong yang mengajak bertindak, dengan maskot
export function EmptyState({ buddy = 'violet', title, children, action }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card bg-surface px-6 py-10 text-center shadow-card">
      <Buddy type={buddy} size={88} />
      <h3 className="text-lg font-bold">{title}</h3>
      {children && <p className="max-w-sm text-sm text-ink-2">{children}</p>}
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}

// Pesan error dengan tombol coba lagi
export function ErrorState({ message, onRetry }) {
  return (
    <EmptyState buddy="jaslab" title="Ada yang tidak beres" action={onRetry && <Button variant="secondary" onClick={onRetry}>Coba lagi</Button>}>
      {message}
    </EmptyState>
  )
}
