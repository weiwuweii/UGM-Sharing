import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ItemCard from '../components/items/ItemCard'
import Button from '../components/ui/Button'
import { EmptyState, ErrorState, Skeleton } from '../components/ui/States'
import { getItems } from '../lib/api'

// Kerangka kartu saat memuat: foto 4:3 + dua baris teks
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
  const [ulang, setUlang] = useState(0) // dinaikkan saat tombol "Coba lagi" ditekan

  // Filter dibaca dari URL, jadi bisa dibagikan dan tahan refresh
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
    <div className="mx-auto max-w-[1200px] px-5 py-6 md:px-6 md:py-10">
      <h1 className="mb-1 text-2xl font-bold md:text-[32px]">Katalog</h1>
      <p className="mb-5 text-sm text-ink-2">
        {loading ? 'Memuat...' : `${total} barang`}
      </p>

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
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}