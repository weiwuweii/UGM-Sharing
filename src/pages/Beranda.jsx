import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Buddy from '../components/buddy/Buddy'
import { BUDDY_TINT } from '../components/buddy/buddyMap'
import ItemCard, { ItemCardSkeleton } from '../components/items/ItemCard'
import Icon from '../components/ui/Icon'
import { getItems, getStats } from '../lib/api'
import { rupiahRingkas } from '../lib/format'
import { useWishlist } from '../lib/useWishlist'

// 'value' harus PERSIS sama dengan isi kolom category di database (sama seperti FilterPanel).
const KATEGORI = [
  { value: 'kalkulator', label: 'Kalkulator', buddy: 'kalkulator' },
  { value: 'kamera', label: 'Kamera', buddy: 'kamera' },
  { value: 'charger', label: 'Charger', buddy: 'charger' },
  { value: 'jas lab', label: 'Jas Lab', buddy: 'jaslab' },
]

export default function Beranda() {
  const navigate = useNavigate()
  const { ids, toggle } = useWishlist()
  const [cari, setCari] = useState('')
  const [stats, setStats] = useState(null)
  const [terbaru, setTerbaru] = useState(null) // null = sedang memuat
  const [jumlah, setJumlah] = useState({})

  useEffect(() => {
    let batal = false
    getStats().then(({ data }) => {
      if (!batal) setStats(data)
    })
    getItems({ sort: 'terbaru' }).then(({ data }) => {
      if (!batal) setTerbaru((data ?? []).slice(0, 4))
    })
    // Jumlah barang per kategori (total dari API)
    Promise.all(KATEGORI.map((k) => getItems({ category: k.value }))).then((hasil) => {
      if (!batal) setJumlah(Object.fromEntries(KATEGORI.map((k, i) => [k.value, hasil[i].total])))
    })
    return () => {
      batal = true
    }
  }, [])

  function kirimCari(e) {
    e.preventDefault()
    const q = cari.trim()
    navigate(q ? `/katalog?search=${encodeURIComponent(q)}` : '/katalog')
  }

  return (
    <div className="pb-28 md:pb-12">
      {/* Hero */}
      <section className="bg-hero text-on-dark">
        <div className="mx-auto grid max-w-[1200px] items-center gap-6 px-5 py-8 md:grid-cols-[1.1fr_1fr] md:px-6 md:py-16">
          <div>
            <p className="mb-4 inline-block rounded-full bg-lime-400 px-3 py-1 text-xs font-semibold text-navy-900">
              Platform pinjam dan beli antarmahasiswa UGM
            </p>
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-[34px] leading-tight font-extrabold md:text-6xl">
                Pinjam dulu, <br className="hidden md:block" />
                beli kalau perlu.
              </h1>
              <div className="flex shrink-0 -space-x-3 md:hidden">
                <Buddy type="kamera" size={64} />
                <Buddy type="kalkulator" size={64} />
              </div>
            </div>
            <span className="mt-3 block h-1.5 w-16 rounded-full bg-lime-400" aria-hidden="true" />
            <p className="mt-4 hidden max-w-md text-on-dark-2 md:block">
              Kalkulator, kamera, charger, jas lab. Pinjam dari sesama mahasiswa dan lihat berapa yang kamu hemat.
            </p>

            <form onSubmit={kirimCari} className="relative mt-6 w-full md:max-w-lg">
              <span className="pointer-events-none absolute top-1/2 left-5 -translate-y-1/2 text-ink-2">
                <Icon name="search" />
              </span>
              <input
                type="search"
                value={cari}
                onChange={(e) => setCari(e.target.value)}
                placeholder="Cari kalkulator, kamera, charger..."
                aria-label="Cari barang"
                className="h-14 w-full rounded-full bg-surface pr-16 pl-14 text-base text-ink focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Cari"
                className="absolute top-1/2 right-2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-lime-400 text-navy-900 transition active:scale-95"
              >
                <Icon name="arrowRight" size={18} />
              </button>
            </form>

            <div className="mt-4 hidden flex-wrap items-center gap-2 text-sm md:flex">
              <span className="text-on-dark-2">Populer:</span>
              {['Kalkulator', 'Kamera', 'Charger'].map((k) => (
                <Link
                  key={k}
                  to={`/katalog?search=${encodeURIComponent(k)}`}
                  className="rounded-full bg-navy-500 px-3 py-1 font-medium text-on-dark hover:brightness-110"
                >
                  {k}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden grid-cols-2 place-items-center gap-6 md:grid" aria-hidden="true">
            <Buddy type="kamera" size={150} />
            <Buddy type="kalkulator" size={130} />
            <Buddy type="charger" size={110} />
            <Buddy type="violet" size={90} />
          </div>
        </div>
      </section>

      <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-5 pt-6 md:gap-10 md:px-6 md:pt-10">
        {/* Kategori */}
        <section aria-labelledby="judul-kategori">
          <h2 id="judul-kategori" className="mb-4 text-xl font-bold md:text-2xl">Jelajahi kategori</h2>

          {/* HP: deretan lingkaran */}
          <div className="flex gap-4 overflow-x-auto pb-1 md:hidden">
            {[...KATEGORI, { value: '', label: 'Lainnya', buddy: 'violet' }].map((k) => (
              <Link
                key={k.label}
                to={k.value ? `/katalog?category=${encodeURIComponent(k.value)}` : '/katalog'}
                className="flex shrink-0 flex-col items-center gap-1.5 text-xs font-medium"
              >
                <span className={`flex size-16 items-center justify-center rounded-full ${BUDDY_TINT[k.buddy]}`}>
                  <Buddy type={k.buddy} size={40} />
                </span>
                {k.label}
              </Link>
            ))}
          </div>

          {/* Desktop: kartu */}
          <div className="hidden grid-cols-5 gap-4 md:grid">
            {[...KATEGORI, { value: '', label: 'Lainnya', buddy: 'violet' }].map((k) => (
              <Link
                key={k.label}
                to={k.value ? `/katalog?category=${encodeURIComponent(k.value)}` : '/katalog'}
                className="flex items-center gap-3 rounded-card bg-surface p-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-float"
              >
                <span className={`flex size-12 shrink-0 items-center justify-center rounded-full ${BUDDY_TINT[k.buddy]}`}>
                  <Buddy type={k.buddy} size={32} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{k.label}</span>
                  <span className="block text-xs text-ink-2">
                    {k.value ? (jumlah[k.value] !== undefined ? `${jumlah[k.value]} barang` : '...') : 'Semua barang'}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Total hemat komunitas */}
        <section
          aria-label="Statistik komunitas"
          className="flex items-center justify-between gap-4 rounded-card bg-lime-400 p-5 text-navy-900 md:px-8 md:py-6"
        >
          <div>
            <p className="text-sm">Total hemat komunitas</p>
            <p className="tabular text-3xl font-bold md:text-4xl">
              {stats ? rupiahRingkas(stats.total_saved_community) : '...'}
            </p>
            <p className="text-xs">Dihitung dari transaksi yang sudah selesai</p>
          </div>
          <div className="hidden gap-10 md:flex">
            <div>
              <p className="tabular text-3xl font-bold">{stats ? stats.total_items : '...'}</p>
              <p className="text-xs">barang tersedia</p>
            </div>
            <div>
              <p className="tabular text-3xl font-bold">{stats ? stats.completed_transactions : '...'}</p>
              <p className="text-xs">transaksi selesai</p>
            </div>
          </div>
          <Buddy type="violet" size={64} />
        </section>

        {/* Baru ditambahkan */}
        <section aria-labelledby="judul-terbaru">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="judul-terbaru" className="text-xl font-bold md:text-2xl">Baru ditambahkan</h2>
            <Link to="/katalog" className="text-sm font-semibold text-navy-500 hover:underline">Lihat semua</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
            {terbaru === null
              ? Array.from({ length: 4 }).map((_, i) => <ItemCardSkeleton key={i} />)
              : terbaru.map((item) => (
                  <ItemCard key={item.id} item={item} saved={ids.has(item.id)} onToggleSaved={toggle} />
                ))}
          </div>
          {terbaru !== null && terbaru.length === 0 && (
            <p className="text-sm text-ink-2">Belum ada barang. Jadi yang pertama memasang barang!</p>
          )}
        </section>
      </div>
    </div>
  )
}