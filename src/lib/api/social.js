import { supabase } from '../supabase'

function rapikanError(error) {
  if (error.message.includes('permission denied')) return 'Silakan login dulu'
  return error.message
}

async function ambilUserId() {
  const { data } = await supabase.auth.getSession()
  return data.session?.user?.id ?? null
}

export async function createReview(bookingId, rating, comment = '') {
  const { data, error } = await supabase.rpc('create_review', {
    p_booking_id: bookingId,
    p_rating: rating,
    p_comment: comment || null,
  })
  if (error) return { data: null, error: rapikanError(error) }
  return { data, error: null }
}

export async function getProfile(userId) {
  const { data, error } = await supabase.rpc('get_public_profile', { p_user_id: userId })
  if (error) return { data: null, error: error.message }
  if (!data?.profile) return { data: null, error: 'Pengguna tidak ditemukan' }
  return { data, error: null }
}

export async function toggleWishlist(itemId) {
  const uid = await ambilUserId()
  if (!uid) return { data: null, error: 'Silakan login dulu' }

  const { data: ada, error: cekError } = await supabase
    .from('wishlists')
    .select('item_id')
    .eq('user_id', uid)
    .eq('item_id', itemId)
    .maybeSingle()
  if (cekError) return { data: null, error: cekError.message }

  if (ada) {
    const { error } = await supabase.from('wishlists').delete().eq('user_id', uid).eq('item_id', itemId)
    if (error) return { data: null, error: error.message }
    return { data: { saved: false }, error: null }
  }

  const { error } = await supabase.from('wishlists').insert({ user_id: uid, item_id: itemId })
  if (error) return { data: null, error: error.message }
  return { data: { saved: true }, error: null }
}

export async function getMyWishlist() {
  const uid = await ambilUserId()
  if (!uid) return { data: null, error: 'Silakan login dulu' }

  const { data, error } = await supabase
    .from('wishlists')
    .select('item:items(id, title, category, listing_type, rent_price_per_day, sale_price, retail_price, photos, status, location)')
    .eq('user_id', uid)
  if (error) return { data: null, error: error.message }
  return { data: (data ?? []).map((row) => row.item).filter(Boolean), error: null }
}

export async function reportItem(itemId, reason) {
  const uid = await ambilUserId()
  if (!uid) return { data: null, error: 'Silakan login dulu' }
  if (!reason || !reason.trim()) return { data: null, error: 'Alasan laporan wajib diisi' }

  const { data, error } = await supabase
    .from('reports')
    .insert({ reporter_id: uid, item_id: itemId, reason: reason.trim() })
    .select('id')
    .single()
  if (error) return { data: null, error: error.message }
  return { data, error: null }
}