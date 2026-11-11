import { supabase } from '../supabase'

const PAGE_SIZE = 12

const LIST_COLUMNS =
  'id, title, category, listing_type, retail_price, rent_price_per_day, sale_price, deposit, condition, location, photos, status, created_at, owner:profiles!owner_id(id, full_name, faculty)'

export async function getItems(filters = {}) {
  const {
    search, category, type, minPrice, maxPrice,
    location, condition, available,
    sort = 'terbaru', page = 1,
  } = filters

  let query = supabase.from('items').select(LIST_COLUMNS, { count: 'exact' })

  if (search) query = query.ilike('title', `%${search}%`)
  if (category) query = query.eq('category', category)
  if (type === 'pinjam') query = query.in('listing_type', ['pinjam', 'keduanya'])
  if (type === 'jual') query = query.in('listing_type', ['jual', 'keduanya'])

  const priceColumn = type === 'jual' ? 'sale_price' : 'rent_price_per_day'
  if (minPrice) query = query.gte(priceColumn, minPrice)
  if (maxPrice) query = query.lte(priceColumn, maxPrice)

  if (location) query = query.eq('location', location)
  if (condition) query = query.eq('condition', condition)
  if (available) query = query.eq('status', 'tersedia')

  if (sort === 'termurah') query = query.order('rent_price_per_day', { ascending: true, nullsFirst: false })
  else if (sort === 'termahal') query = query.order('rent_price_per_day', { ascending: false, nullsFirst: false })
  else query = query.order('created_at', { ascending: false })

  const from = (page - 1) * PAGE_SIZE
  query = query.range(from, from + PAGE_SIZE - 1)

  const { data, error, count } = await query
  return { data: data ?? [], total: count ?? 0, error: error ? error.message : null }
}

export async function getItem(id) {
  const { data, error } = await supabase
    .from('items')
    .select('*, owner:profiles!owner_id(id, full_name, faculty, avatar_url)')
    .eq('id', id)
    .single()

  if (error) return { data: null, error: error.message }

  const { data: ranges } = await supabase.rpc('get_booked_ranges', { p_item_id: id })

  return { data: { ...data, booked_ranges: ranges ?? [] }, error: null }
}