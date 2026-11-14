import { useEffect, useState } from 'react'
import { supabase } from './supabase'

// Status login yang selalu terbaru (berubah otomatis saat masuk atau keluar).
// user: null = belum login, undefined = masih dicek.
export function useSession() {
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    let aktif = true
    supabase.auth.getSession().then(({ data }) => {
      if (aktif) setUser(data.session?.user ?? null)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => {
      aktif = false
      data.subscription.unsubscribe()
    }
  }, [])

  return { user, loading: user === undefined }
}
