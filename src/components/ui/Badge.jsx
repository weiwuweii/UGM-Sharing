// Label kecil berbentuk pill. Sesuai komponen Badge di Figma.

const TONES = {
  lime: 'bg-lime-200 text-navy-900',
  navy: 'bg-navy-700 text-on-dark',
  soft: 'bg-bg-soft text-ink-2',
  yellow: 'bg-tint-yellow text-navy-900',
  coral: 'bg-tint-coral text-navy-900',
  success: 'bg-lime-200 text-navy-900',
}

export default function Badge({ tone = 'lime', className = '', children }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium leading-none ${TONES[tone]} ${className}`}>
      {children}
    </span>
  )
}

// Badge tipe listing barang: Pinjam / Beli / Dipinjam
export function ListingBadges({ listingType, status }) {
  if (status === 'dipinjam') return <Badge tone="soft">Dipinjam</Badge>
  if (status === 'terjual') return <Badge tone="soft">Terjual</Badge>
  return (
    <span className="flex gap-1.5">
      {listingType !== 'jual' && <Badge tone="lime">Pinjam</Badge>}
      {listingType !== 'pinjam' && <Badge tone="navy">Beli</Badge>}
    </span>
  )
}

// Status booking dengan warna dan bentuk berbeda, supaya terlihat sekilas
const BOOKING = {
  pending: ['Menunggu', 'yellow'],
  disetujui: ['Disetujui', 'success'],
  ditolak: ['Ditolak', 'coral'],
  dibatalkan: ['Dibatalkan', 'soft'],
  selesai: ['Selesai', 'navy'],
}

export function BookingStatus({ status }) {
  const [label, tone] = BOOKING[status] ?? [status, 'soft']
  return <Badge tone={tone}>{label}</Badge>
}

// Status barang di "Barang Saya"
const ITEM = {
  tersedia: ['Tersedia', 'text-success', 'bg-success'],
  dipinjam: ['Dipinjam', 'text-ink-2', 'bg-buddy-yellow'],
  terjual: ['Terjual', 'text-ink-2', 'bg-ink-2'],
  nonaktif: ['Nonaktif', 'text-ink-2', 'bg-line'],
}

export function ItemStatus({ status }) {
  const [label, text, dot] = ITEM[status] ?? [status, 'text-ink-2', 'bg-line']
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${text}`}>
      <span className={`size-2 rounded-full ${dot}`} aria-hidden="true" />
      {label}
    </span>
  )
}
