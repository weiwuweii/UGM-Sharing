import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ItemCard from '../components/items/ItemCard'
import Button from '../components/ui/Button'
import { EmptyState, ErrorState, Skeleton } from '../components/ui/States'
import { getItems } from '../lib/api'

const PER_HALAMAN = 12 

function KartuSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="aspect-[4/3] w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  )
}

export default function Katalog() {
  const [params, setParams] = useSearchParams()
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [ulang, setUlang] = useState(0)

  const filters = {
    search: params.get('search') || '',
    category: params.get('category') || '',
    type: params.get('type') || '',
    condition: params.get('condition') || '',
    available: params.get('available') === '1',
    sort: params.get('sort') || 'terbaru',
    page: Number(params.get('page') || 1),
  }
  const adaFilter = params.toString() !== ''

  // mengisi kotak cari (ikut berubah kalau URL berubah, mis. saat "Hapus filter")
  const [cari, setCari] = useState(filters.search)
  useEffect(() => {
    setCari(filters.search)
  }, [filters.search])

  // fungsi pengubah URL. Setiap filter/cari/urut berubah, halaman balik ke 1
  function ubahParam(nama, nilai) {
    const baru = new URLSearchParams(params)
    if (nilai) baru.set(nama, nilai)
    else baru.delete(nama)
    if (nama !== 'page') baru.delete('page')
    setParams(baru)
  }

  // BARU
  function kirimCari(e) {
    e.preventDefault()
    ubahParam('search', cari.trim())
  }

  const totalHalaman = Math.max(1, Math.ceil(total / PER_HALAMAN)) // BARU

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

  return (
    <div className="mx-auto max-w-[1200px] px-5 pt-6 pb-28 md:px-6 md:py-10">
      <h1 className="mb-1 text-2xl font-bold md:text-[32px]">Katalog</h1>
      <p className="mb-5 text-sm text-ink-2">
        {loading ? 'Memuat...' : `${total} barang`}
      </p>

      {/* baris cari + urutan. Letaknya di luar blok loading supaya tidak hilang saat memuat */}
      <div className="mb-6 flex flex-col gap-3 md:flex-row">
        <form onSubmit={kirimCari} className="flex flex-1 gap-2">
          <input
            type="search"
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            placeholder="Cari barang..."
            aria-label="Cari barang"
            className="h-11 flex-1 rounded-full border border-gray-300 px-4 text-sm"
          />
          <Button type="submit">Cari</Button>
        </form>

        <select
          value={filters.sort}
          onChange={(e) => ubahParam('sort', e.target.value)}
          aria-label="Urutkan"
          className="h-11 rounded-full border border-gray-300 px-4 text-sm"
        >
          <option value="terbaru">Terbaru</option>
          <option value="termurah">Termurah</option>
          <option value="termahal">Termahal</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <KartuSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => setUlang((n) => n + 1)} />
      ) : items.length === 0 ? (
        <EmptyState
          title="Barang tidak ditemukan"
          action={
            adaFilter && (
              <Button variant="secondary" onClick={() => setParams({})}>
                Hapus filter
              </Button>
            )
          }
        >
          Coba kata kunci atau filter yang lain.
        </EmptyState>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>

          {/* paginasi */}
          {totalHalaman > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <Button
                variant="secondary"
                disabled={filters.page <= 1}
                onClick={() => ubahParam('page', String(filters.page - 1))}
              >
                Sebelumnya
              </Button>
              <span className="text-sm">
                Halaman {filters.page} dari {totalHalaman}
              </span>
              <Button
                variant="secondary"
                disabled={filters.page >= totalHalaman}
                onClick={() => ubahParam('page', String(filters.page + 1))}
              >
                Berikutnya
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}