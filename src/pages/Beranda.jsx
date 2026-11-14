import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Buddy from '../components/buddy/Buddy'
import { BUDDY_TINT, buddyForCategory } from '../components/buddy/buddyMap'
import ItemCard, { ItemCardSkeleton } from '../components/items/ItemCard'
import Icon from '../components/ui/Icon'
import { getItems, getStats } from '../lib/api'
import { rupiahRingkas } from '../lib/format'
import { useWishlist } from '../lib/useWishlist'
import { KATEGORI as PILIHAN_KATEGORI } from '../content/pilihan'
import { rupiah } from '../lib/format'

// Kategori diambil dari src/content/pilihan.js (sama dengan Katalog dan Pasang Barang).
const KATEGORI = PILIHAN_KATEGORI.map((k) => ({ ...k, buddy: buddyForCategory(k.value) }))
const SEMUA = { value: '', label: 'Semua', buddy: 'violet' }

const LANGKAH = [
  { judul: 'Cari barang', teks: 'Temukan barang dari sesama mahasiswa di dekat fakultasmu.', icon: 'search' },
  { judul: 'Ajukan pinjam', teks: 'Pilih tanggal dan lihat hematnya dibanding beli baru.', icon: 'calendar' },
  { judul: 'Ketemuan dan pakai', teks: 'Setelah disetujui, chat pemilik lewat WhatsApp untuk serah terima.', icon: 'chat' },
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
      if (!batal) setTerbaru((data ?? []).slice(0, 8))
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

          <div className="relative hidden h-[400px] md:block" aria-hidden="true">
            <div className="absolute -top-2 -left-2 rotate-[-8deg]"><Buddy type="kamera" size={110} /></div>
            <div className="absolute top-0 right-4 rotate-[6deg]"><Buddy type="kalkulator" size={120} /></div>
            <div className="absolute bottom-6 left-0 rotate-[4deg]"><Buddy type="jaslab" size={110} /></div>
            <div className="absolute right-0 bottom-0 rotate-[-6deg]"><Buddy type="charger" size={120} /></div>

            {/* Kartu contoh Kalkulator Hemat */}
            <div className="absolute top-[54%] left-1/2 w-[290px] -translate-x-1/2 -translate-y-1/2 rounded-card bg-surface p-5 text-ink shadow-float">
              <div className="flex items-center gap-3">
                <span className="flex size-12 items-center justify-center rounded-field bg-tint-blue"><Buddy type="kalkulator" size={36} /></span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">Kalkulator Casio fx-991</p>
                  <p className="text-xs text-ink-2">Pinjam 3 hari · FMIPA</p>
                </div>
              </div>
              <dl className="mt-4 flex flex-col gap-1.5 text-sm">
                <div className="flex justify-between"><dt className="text-ink-2">Beli baru</dt><dd className="tabular line-through decoration-ink-2/60">{rupiah(265000)}</dd></div>
                <div className="flex justify-between"><dt className="text-ink-2">Pinjam 3 hari</dt><dd className="tabular font-semibold">{rupiah(24000)}</dd></div>
              </dl>
              <p className="mt-3 rounded-field bg-lime-400 px-3 py-2 text-center text-sm font-bold text-navy-900">Kamu hemat {rupiah(241000)}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-5 pt-6 md:gap-10 md:px-6 md:pt-10">
        {/* Kategori */}
        <section aria-labelledby="judul-kategori">
          <h2 id="judul-kategori" className="mb-4 text-xl font-bold md:text-2xl">Jelajahi kategori</h2>

          {/* HP: deretan lingkaran */}
          <div className="flex gap-4 overflow-x-auto pb-1 md:hidden">
            {[...KATEGORI, SEMUA].map((k) => (
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
          <div className="hidden grid-cols-4 gap-4 md:grid">
            {[...KATEGORI, SEMUA].map((k) => (
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
          className="relative grid gap-4 overflow-hidden rounded-card bg-lime-400 p-5 text-navy-900 md:grid-cols-[1.4fr_1fr_1fr_auto] md:items-center md:gap-8 md:px-8 md:py-7"
        >
          <div className="pr-20 md:pr-0">
            <p className="text-sm font-medium">Total hemat komunitas</p>
            <p className="tabular text-3xl font-extrabold md:text-4xl">
              {stats ? rupiahRingkas(stats.total_saved_community) : '...'}
            </p>
            <p className="text-xs">dibanding beli baru, dari transaksi yang sudah selesai</p>
          </div>
          <div className="flex gap-8 md:contents">
            <div className="md:border-l md:border-navy-900/15 md:pl-8">
              <p className="tabular text-2xl font-bold md:text-3xl">{stats ? stats.total_items : '...'}</p>
              <p className="text-xs">barang tersedia</p>
            </div>
            <div className="md:border-l md:border-navy-900/15 md:pl-8">
              <p className="tabular text-2xl font-bold md:text-3xl">{stats ? stats.completed_transactions : '...'}</p>
              <p className="text-xs">transaksi selesai</p>
            </div>
          </div>
          <div className="absolute top-5 right-5 md:static"><Buddy type="violet" size={64} /></div>
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
              : terbaru.map((item, i) => (
                  // HP cukup 4 barang, desktop 8 barang (2 baris)
                  <div key={item.id} className={i >= 4 ? 'hidden md:grid' : 'grid'}>
                    <ItemCard item={item} saved={ids.has(item.id)} onToggleSaved={toggle} />
                  </div>
                ))}
          </div>
          {terbaru !== null && terbaru.length === 0 && (
            <p className="text-sm text-ink-2">Belum ada barang. Jadi yang pertama memasang barang!</p>
          )}
        </section>

        {/* Cara kerja singkat */}
        <section aria-labelledby="judul-cara">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="judul-cara" className="text-xl font-bold md:text-2xl">Pinjam dalam 3 langkah</h2>
            <Link to="/cara-kerja" className="text-sm font-semibold text-navy-500 hover:underline">Aturan main</Link>
          </div>
          <ol className="grid gap-3 md:grid-cols-3 md:gap-6">
            {LANGKAH.map((l, i) => (
              <li key={l.judul} className="flex gap-4 rounded-card bg-surface p-5 shadow-card">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-navy-700 text-lime-400">
                  <Icon name={l.icon} />
                </span>
                <div>
                  <p className="text-xs font-semibold text-navy-500">Langkah {i + 1}</p>
                  <h3 className="font-bold">{l.judul}</h3>
                  <p className="mt-1 text-sm text-ink-2">{l.teks}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Ajakan untuk pemilik barang */}
        <section className="bg-hero relative flex flex-col items-start gap-4 overflow-hidden rounded-sheet p-6 text-on-dark md:flex-row md:items-center md:justify-between md:p-10">
          <div className="max-w-lg">
            <h2 className="text-2xl font-bold md:text-3xl">Punya barang yang jarang dipakai?</h2>
            <p className="mt-2 text-on-dark-2">Pasang di UGM Sharing dan biarkan barangmu menghasilkan uang saku, sambil membantu teman hemat.</p>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/pasang" className="inline-flex h-12 items-center gap-2 rounded-full bg-lime-400 px-6 text-sm font-semibold text-navy-900 transition hover:brightness-95">
              Pasang Barang <Icon name="arrowRight" size={18} />
            </Link>
            <Buddy type="charger" size={90} className="hidden md:block" />
          </div>
        </section>
      </div>
    </div>
  )
}