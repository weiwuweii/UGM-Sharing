import { useCallback, useEffect, useState } from 'react'
import { getMyWishlist, toggleWishlist } from './api'
import { useToast } from '../components/ui/toast'

// Daftar id barang yang disimpan pengguna, plus fungsi untuk menyimpan atau menghapus.
// Kalau belum login, daftarnya kosong dan toggle menampilkan pesan "Silakan login dulu".
export function useWishlist() {
  const toast = useToast()
  const [ids, setIds] = useState(() => new Set())

  useEffect(() => {
    let batal = false
    getMyWishlist().then(({ data }) => {
      if (!batal && data) setIds(new Set(data.map((i) => i.id)))
    })
    return () => {
      batal = true
    }
  }, [])

  const toggle = useCallback(
    async (item) => {
      const res = await toggleWishlist(item.id)
      if (res.error) {
        toast(res.error, 'error')
        return
      }
      setIds((sebelum) => {
        const baru = new Set(sebelum)
        if (res.data.saved) baru.add(item.id)
        else baru.delete(item.id)
        return baru
      })
      toast(res.data.saved ? 'Barang disimpan' : 'Dihapus dari simpanan')
    },
    [toast],
  )

  return { ids, toggle }
}