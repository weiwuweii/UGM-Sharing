import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Buddy from '../components/buddy/Buddy'
import { BUDDY_TINT, buddyForCategory } from '../components/buddy/buddyMap'
import AjukanSheet from '../components/detail/AjukanSheet'
import KalkulatorHemat from '../components/detail/KalkulatorHemat'
import LaporSheet from '../components/detail/LaporSheet'
import Badge, { ItemStatus } from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Icon from '../components/ui/Icon'
import { EmptyState, Skeleton } from '../components/ui/States'
import { useToast } from '../components/ui/toast'
import { getItem, getMyWishlist, getProfile, toggleWishlist } from '../lib/api'
import { rupiah } from '../lib/format'

const KONDISI = { baru: 'Baru', seperti_baru: 'Seperti baru', baik: 'Baik', layak_pakai: 'Layak pakai' }

function Galeri({ item, buddy, saved, onSimpan }) {
  const [aktif, setAktif] = useState(0)
  const [gagal, setGagal] = useState({})
  const fotos = (item.photos ?? []).slice(0, 4)
  const foto = fotos[aktif] && !gagal[aktif] ? fotos[aktif] : null

  return (
    <div>
      <div className={`relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-card lg:aspect-[6/5] ${BUDDY_TINT[buddy]}`}>
        {foto ? (
          <img
            src={foto}
            alt={item.title}
            onError={() => setGagal((g) => ({ ...g, [aktif]: true }))}
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          <Buddy type={buddy} size={200} />
        )}
        <Link
          to="/katalog"
          aria-label="Kembali ke katalog"
          className="absolute top-3 left-3 inline-flex size-10 items-center justify-center rounded-full bg-surface shadow-card lg:hidden"
        >
          <Icon name="arrowLeft" />
        </Link>
        <button
          type="button"
          onClick={onSimpan}
          aria-pressed={saved}
          aria-label={saved ? 'Hapus dari simpanan' : 'Simpan barang'}
          className="absolute top-3 right-3 inline-flex size-10 items-center justify-center rounded-full bg-surface shadow-card transition active:scale-90 lg:top-5 lg:right-5 lg:size-12"
        >
          <Icon name="heart" filled={saved} className={saved ? 'text-buddy-coral' : ''} />
        </button>
      </div>

      {fotos.length > 1 && (
        <div className="mt-3 flex gap-3">
          {fotos.map((f, i) => (
            <button
              key={f}
              type="button"
              onClick={() => setAktif(i)}
              aria-label={`Foto ${i + 1}`}
              aria-current={i === aktif}
              className={`relative aspect-[4/3] w-20 overflow-hidden rounded-field bg-bg-soft md:w-28 ${
                i === aktif ? 'ring-2 ring-navy-700' : 'opacity-80'
              }`}
            >
              {!gagal[i] && <img src={f} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function Memuat() {
  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
      <Skeleton className="aspect-[4/3] w-full lg:aspect-[6/5]" />
      <div className="flex flex-col gap-3">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  )
}

export default function DetailBarang() {
  const { id } = useParams()
  const toast = useToast()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [profil, setProfil] = useState(null)
  const [saved, setSaved] = useState(false)
  const [sheet, setSheet] = useState(null) // null | 'pinjam' | 'beli' | 'lapor'

  useEffect(() => {
    let batal = false
    setLoading(true)
    getItem(id).then((res) => {
      if (batal) return
      setItem(res.data)
      setError(res.error)
      setLoading(false)
    })
    return () => {
      batal = true
    }
  }, [id])

  // Rating pemilik dan status simpan (kalau belum login, hasilnya kosong saja)
  useEffect(() => {
    if (!item) return
    let batal = false
    getProfile(item.owner?.id).then(({ data }) => {
      if (!batal) setProfil(data?.profile ?? null)
    })
    getMyWishlist().then(({ data }) => {
      if (!batal) setSaved(!!data?.some((i) => i.id === item.id))
    })
    return () => {
      batal = true
    }
  }, [item?.id])

  async function simpan() {
    const res = await toggleWishlist(item.id)
    if (res.error) {
      toast(res.error, 'error')
      return
    }
    setSaved(res.data.saved)
    toast(res.data.saved ? 'Barang disimpan' : 'Dihapus dari simpanan')
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-[1200px] px-5 pt-6 pb-28 md:px-6 md:py-10">
        <Memuat />
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="mx-auto max-w-[1200px] px-5 pt-6 pb-28 md:px-6 md:py-10">
        <EmptyState title="Barang tidak ditemukan" action={<Button variant="secondary" to="/katalog">Ke katalog</Button>}>
          Barang ini mungkin sudah dihapus atau linknya salah.
        </EmptyState>
      </div>
    )
  }

  const buddy = buddyForCategory(`${item.category ?? ''} ${item.title ?? ''}`)
  const bisaPinjam = item.listing_type !== 'jual'
  const bisaBeli = item.listing_type !== 'pinjam'
  const aktif = !['terjual', 'nonaktif'].includes(item.status)
  const tampilkanKalkulator = bisaPinjam && item.retail_price > 0 && item.rent_price_per_day > 0

  const hargaUtama = bisaPinjam ? item.rent_price_per_day : item.sale_price
  const tambahan = []
  if (bisaPinjam && item.deposit > 0) tambahan.push(`deposit ${rupiah(item.deposit)}`)
  if (bisaPinjam && bisaBeli) tambahan.push(`atau beli ${rupiah(item.sale_price)}`)

  const ratingTeks =
    profil?.review_count > 0
      ? `${Number(profil.rating_avg).toFixed(1).replace('.', ',')} (${profil.review_count} ulasan)`
      : 'Belum ada ulasan'
  const kategori = item.category ? item.category[0].toUpperCase() + item.category.slice(1) : ''

  return (
    <div className="mx-auto max-w-[1200px] px-5 pt-5 pb-28 md:px-6 md:py-8">
      <nav aria-label="Navigasi" className="mb-4 hidden text-sm text-ink-2 lg:block">
        <Link to="/katalog" className="hover:underline">Katalog</Link>
        {kategori && (
          <>
            {' / '}
            <Link to={`/katalog?category=${encodeURIComponent(item.category)}`} className="hover:underline">{kategori}</Link>
          </>
        )}
        {' / '}
        <span>{item.title}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
        <Galeri item={item} buddy={buddy} saved={saved} onSimpan={simpan} />

        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {bisaPinjam && <Badge tone="lime">Pinjam</Badge>}
            {bisaBeli && <Badge tone="navy">Beli</Badge>}
            <ItemStatus status={item.status} />
          </div>

          <h1 className="text-2xl font-bold md:text-4xl">{item.title}</h1>

          <p>
            <span className="tabular text-3xl font-bold text-navy-700">{rupiah(hargaUtama)}</span>{' '}
            <span className="text-sm text-ink-2">
              {bisaPinjam ? '/hari' : 'beli'}
              {tambahan.length > 0 && ` · ${tambahan.join(' · ')}`}
            </span>
          </p>

          {item.description && <p className="leading-relaxed text-ink-2">{item.description}</p>}

          <p className="flex items-center gap-2 text-sm text-ink-2">
            <Icon name="pin" size={16} />
            {item.location}
            {item.condition && ` · kondisi ${KONDISI[item.condition] ?? item.condition}`}
          </p>

          {/* Pemilik */}
          <div className="flex items-center gap-3 rounded-card bg-surface p-4 shadow-card">
            <div className="shrink-0">
              {item.owner?.avatar_url ? (
                <img src={item.owner.avatar_url} alt="" className="size-12 rounded-full object-cover" />
              ) : (
                <Buddy type="violet" size={48} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{item.owner?.full_name ?? 'Pengguna'}</p>
              <p className="flex items-center gap-1 truncate text-xs text-ink-2">
                {item.owner?.faculty ? `${item.owner.faculty} · ` : ''}
                <Icon name="star" size={12} className="text-buddy-yellow" filled />
                {ratingTeks}
              </p>
            </div>
            <Link to={`/profil/${item.owner?.id}`} className="shrink-0 text-sm font-semibold text-navy-500 hover:underline">
              Lihat profil
            </Link>
          </div>

          {tampilkanKalkulator && <KalkulatorHemat item={item} />}

          {/* Tombol aksi */}
          {aktif ? (
            <div className="flex gap-3">
              {bisaPinjam && bisaBeli && (
                <Button variant="secondary" onClick={() => setSheet('beli')}>
                  Beli {rupiah(item.sale_price)}
                </Button>
              )}
              {bisaPinjam ? (
                <Button full onClick={() => setSheet('pinjam')}>Ajukan Pinjam</Button>
              ) : (
                <Button full onClick={() => setSheet('beli')}>Ajukan Beli {rupiah(item.sale_price)}</Button>
              )}
            </div>
          ) : (
            <p className="rounded-field bg-bg-soft px-4 py-3 text-sm text-ink-2">Barang ini sudah tidak tersedia.</p>
          )}

          <button
            type="button"
            onClick={() => setSheet('lapor')}
            className="flex w-fit items-center gap-1.5 text-sm text-ink-2 hover:underline"
          >
            <Icon name="alert" size={14} />
            Laporkan barang ini
          </button>
        </div>
      </div>

      {(sheet === 'pinjam' || sheet === 'beli') && (
        <AjukanSheet open onClose={() => setSheet(null)} item={item} mode={sheet} />
      )}
      {sheet === 'lapor' && <LaporSheet open onClose={() => setSheet(null)} itemId={item.id} />}
    </div>
  )
}