import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Buddy from '../components/buddy/Buddy'
import ItemCard, { ItemCardSkeleton } from '../components/items/ItemCard'
import FilterPanel from '../components/katalog/FilterPanel'
import Button from '../components/ui/Button'
import Field from '../components/ui/Field'
import Icon from '../components/ui/Icon'
import Sheet from '../components/ui/Sheet'
import { EmptyState, ErrorState } from '../components/ui/States'
import { getItems } from '../lib/api'

const PAGE_SIZE = 12
const URUTAN = [
  { value: 'terbaru', label: 'Urutkan: Terbaru' },
  { value: 'termurah', label: 'Urutkan: Termurah' },
  { value: 'termahal', label: 'Urutkan: Termahal' },
]

function Pagination({ page, pages, onChange }) {
  const mulai = Math.max(1, Math.min(page - 2, pages - 4))
  const akhir = Math.min(pages, mulai + 4)
  const nomor = []
  for (let i = mulai; i <= akhir; i++) nomor.push(i)

  return (
    <nav aria-label="Halaman" className="mt-8 flex items-center justify-center gap-2">
      {nomor.map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-current={n === page ? 'page' : undefined}
          aria-label={`Halaman ${n}`}
          className={`size-11 rounded-full text-sm font-semibold transition ${
            n === page ? 'bg-navy-700 text-on-dark' : 'bg-surface text-ink ring-1 ring-line hover:bg-bg-soft'
          }`}
        >
          {n}
        </button>
      ))}
    </nav>
  )
}

export default function Katalog() {
  const [params, setParams] = useSearchParams()
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [ulang, setUlang] = useState(0)
  const [laciBuka, setLaciBuka] = useState(false)
  const [cari, setCari] = useState(params.get('search') || '')
  const [min, setMin] = useState(params.get('minPrice') || '')
  const [max, setMax] = useState(params.get('maxPrice') || '')

  const filters = {
    search: params.get('search') || '',
    category: params.get('category') || '',
    type: params.get('type') || '',
    condition: params.get('condition') || '',
    location: params.get('location') || '',
    minPrice: params.get('minPrice') || '',
    maxPrice: params.get('maxPrice') || '',
    available: params.get('available') === '1',
    sort: params.get('sort') || 'terbaru',
    page: Number(params.get('page') || 1),
  }
  const adaFilter = [...params.keys()].some((k) => k !== 'sort' && k !== 'page')

  // Ubah satu filter di URL (pakai versi "fungsi" supaya beberapa perubahan berturut-turut tidak saling menimpa)
  function ubah(nama, nilai) {
    setParams((sebelum) => {
      const baru = new URLSearchParams(sebelum)
      if (nilai) baru.set(nama, nilai)
      else baru.delete(nama)
      if (nama !== 'page') baru.delete('page')
      return baru
    })
  }

  function reset() {
    setCari('')
    setMin('')
    setMax('')
    setParams({})
  }

  // Debounce pencarian: tunggu 400 ms setelah berhenti mengetik
  useEffect(() => {
    const t = setTimeout(() => {
      if (cari.trim() !== (params.get('search') || '')) ubah('search', cari.trim())
    }, 400)
    return () => clearTimeout(t)
  }, [cari])

  useEffect(() => {
    let batal = false
    setLoading(true)
    getItems(filters).then((res) => {
      if (batal) return
      setItems(res.data ?? [])
      setTotal(res.total ?? 0)
      setError(res.error)
      setLoading(false)
    })
    return () => {
      batal = true
    }
  }, [params.toString(), ulang])

  const jumlahHalaman = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const panel = (
    <FilterPanel filters={filters} ubah={ubah} harga={{ min, max, setMin, setMax }} onReset={reset} />
  )

  return (
    <div>
      {/* Header: judul di kiri, kolom cari melebar di tengah, maskot di kanan */}
      <header className="bg-hero text-on-dark">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-4 px-5 py-6 md:flex-row md:items-center md:gap-8 md:px-6 md:py-10">
          <div className="shrink-0">
            <h1 className="text-2xl font-bold md:text-[40px] md:leading-tight">Katalog</h1>
            <p className="text-sm text-on-dark-2 md:text-base">
              {loading ? 'Memuat...' : `${total} barang tersedia`}
            </p>
          </div>

          <div className="relative w-full md:flex-1">
            <span className="pointer-events-none absolute top-1/2 left-5 -translate-y-1/2 text-ink-2">
              <Icon name="search" />
            </span>
            <input
              type="search"
              value={cari}
              onChange={(e) => setCari(e.target.value)}
              placeholder="Cari barang..."
              aria-label="Cari barang"
              className="h-14 w-full rounded-full bg-surface pr-5 pl-14 text-base text-ink focus:outline-none"
            />
          </div>

          <div className="hidden shrink-0 md:block">
            <Buddy type="kalkulator" size={96} />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1200px] gap-6 px-5 pt-6 pb-28 md:px-6 md:py-8 lg:grid-cols-[280px_1fr] lg:gap-8">
        <aside className="hidden h-fit rounded-card bg-surface p-5 shadow-card lg:block">{panel}</aside>

        <section className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink-2">
              {loading ? 'Memuat...' : `Menampilkan ${items.length} dari ${total} barang`}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="lg:hidden"
                icon={<Icon name="sliders" size={16} />}
                onClick={() => setLaciBuka(true)}
              >
                Filter
              </Button>
              <Field as="select" aria-label="Urutkan" value={filters.sort} onChange={(e) => ubah('sort', e.target.value)}>
                {URUTAN.map((u) => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </Field>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <ItemCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <ErrorState message={error} onRetry={() => setUlang((n) => n + 1)} />
          ) : items.length === 0 ? (
            <EmptyState
              title="Barang tidak ditemukan"
              action={adaFilter && <Button variant="secondary" onClick={reset}>Hapus filter</Button>}
            >
              Coba kata kunci atau filter yang lain.
            </EmptyState>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6">
              {items.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}

          {!loading && !error && total > PAGE_SIZE && (
            <Pagination page={filters.page} pages={jumlahHalaman} onChange={(n) => ubah('page', String(n))} />
          )}
        </section>
      </div>

      {/* Laci filter untuk HP */}
      <Sheet
        open={laciBuka}
        onClose={() => setLaciBuka(false)}
        title="Filter"
        footer={<Button full onClick={() => setLaciBuka(false)}>Lihat {total} barang</Button>}
      >
        {panel}
      </Sheet>
    </div>
  )
}