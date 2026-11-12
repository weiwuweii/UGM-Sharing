import { useState } from 'react'
import { Link } from 'react-router-dom'
import Buddy from '../buddy/Buddy'
import { BUDDY_TINT, buddyForCategory } from '../buddy/buddyMap'
import { ListingBadges } from '../ui/Badge'
import Icon from '../ui/Icon'
import { rupiah } from '../../lib/format'

// Kartu barang untuk Beranda, Katalog, dan Profil. Sesuai komponen Item Card di Figma.
// `item` mengikuti bentuk item dari getItems() di API_CONTRACT.md.
// Kalau barang belum punya foto atau fotonya gagal dimuat, kartu menampilkan maskot sesuai kategori.
export default function ItemCard({ item, saved = false, onToggleSaved }) {
  const buddy = buddyForCategory(`${item.category ?? ''} ${item.title ?? ''}`)
  const [photoFailed, setPhotoFailed] = useState(false)
  const photo = photoFailed ? null : item.photos?.[0]
  const bisaPinjam = item.listing_type !== 'jual'
  const harga = bisaPinjam ? item.rent_price_per_day : item.sale_price
  const unit = bisaPinjam ? '/hari' : 'beli'

  return (
    <article className="group relative flex min-w-0 flex-col overflow-hidden rounded-card bg-surface shadow-card transition hover:-translate-y-0.5 hover:shadow-float">
      <div className={`relative flex aspect-[4/3] items-center justify-center ${BUDDY_TINT[buddy]}`}>
        {photo ? (
          <img src={photo} alt="" loading="lazy" onError={() => setPhotoFailed(true)} className="absolute inset-0 size-full object-cover" />
        ) : (
          <Buddy type={buddy} size={88} className="transition group-hover:scale-105" />
        )}
        <div className="absolute top-2.5 left-2.5">
          <ListingBadges listingType={item.listing_type} status={item.status} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 px-3 pt-3 pb-3.5">
        <h3 className="line-clamp-2 min-h-10 text-sm leading-5 font-semibold">
          <Link to={`/barang/${item.id}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {item.title}
          </Link>
        </h3>
        <p className="truncate text-xs font-medium text-ink-2">
          {item.location}
          {item.owner?.faculty ? ` · ${item.owner.faculty}` : ''}
        </p>
        <p className="mt-auto pt-1">
          <span className="tabular text-base font-bold text-navy-700">{rupiah(harga)}</span>{' '}
          <span className="text-xs text-ink-2">{unit}</span>
        </p>
      </div>

      {onToggleSaved && (
        <button
          type="button"
          onClick={() => onToggleSaved(item)}
          aria-pressed={saved}
          aria-label={saved ? 'Hapus dari simpanan' : 'Simpan barang'}
          className="absolute top-2.5 right-2.5 z-10 inline-flex size-8 items-center justify-center rounded-full bg-surface text-ink shadow-card transition active:scale-90"
        >
          <Icon name="heart" size={16} filled={saved} className={saved ? 'text-buddy-coral' : ''} />
        </button>
      )}
    </article>
  )
}

// Kerangka kartu saat katalog dimuat
export function ItemCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-card bg-surface shadow-card" aria-hidden="true">
      <div className="aspect-[4/3] animate-pulse bg-bg-soft" />
      <div className="space-y-2 p-3">
        <div className="h-4 w-4/5 animate-pulse rounded bg-bg-soft" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-bg-soft" />
        <div className="h-4 w-2/5 animate-pulse rounded bg-bg-soft" />
      </div>
    </div>
  )
}
