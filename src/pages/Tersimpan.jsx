import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import ItemCard from '../components/items/ItemCard'
import Button from '../components/ui/Button'
import { EmptyState, ErrorState, Skeleton } from '../components/ui/States'
import { useToast } from '../components/ui/toast'
import { getMyWishlist, toggleWishlist } from '../lib/api'
import { useSession } from '../lib/useSession'

// Barang Tersimpan (F11): daftar barang yang ditandai hati.
export default function Tersimpan() {
  const { user, loading } = useSession()
  const toast = useToast()
  const [items, setItems] = useState(null)
  const [error, setError] = useState(null)
  const [muatUlang, setMuatUlang] = useState(0)

  useEffect(() => {
    if (!user) return
    let batal = false
    getMyWishlist().then(({ data, error: err }) => {
      if (batal) return
      setError(err)
      setItems(data ?? [])
    })
    return () => { batal = true }
  }, [user, muatUlang])

  if (!loading && !user) return <Navigate to="/masuk?next=/tersimpan" replace />

  async function hapus(item) {
    const res = await toggleWishlist(item.id)
    if (res.error) return toast(res.error, 'error')
    setItems((list) => list.filter((i) => i.id !== item.id))
    toast('Dihapus dari simpanan')
  }

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-8 md:px-6 md:py-12">
      <h1 className="text-2xl font-bold md:text-3xl">Barang Tersimpan</h1>
      <p className="mt-1 text-sm text-ink-2">Barang yang kamu tandai hati, supaya gampang ditemukan lagi.</p>

      <div className="mt-6">
        {error ? (
          <ErrorState message={error} onRetry={() => { setItems(null); setError(null); setMuatUlang((n) => n + 1) }} />
        ) : items === null ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
            {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="aspect-[3/4]" />)}
          </div>
        ) : items.length === 0 ? (
          <EmptyState buddy="kamera" title="Belum ada barang tersimpan" action={<Button to="/katalog">Jelajahi Katalog</Button>}>
            Tekan ikon hati di kartu barang untuk menyimpannya di sini.
          </EmptyState>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
            {items.map((item) => <ItemCard key={item.id} item={item} saved onToggleSaved={hapus} />)}
          </div>
        )}
      </div>
    </div>
  )
}
