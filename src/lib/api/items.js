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

// ===== Tambah barang =====

const MAX_PHOTOS = 4
const MAX_PHOTO_SIZE = 1024 * 1024 // 1 MB

const TEXT_FIELDS = ['title', 'description', 'category', 'listing_type', 'condition', 'location']
const NUMBER_FIELDS = ['retail_price', 'rent_price_per_day', 'sale_price', 'deposit']

function ambilField(data, hanyaYangAda = false) {
  const hasil = {}
  for (const key of TEXT_FIELDS) {
    if (hanyaYangAda && !(key in data)) continue
    hasil[key] = typeof data[key] === 'string' ? data[key].trim() : data[key] ?? null
  }
  for (const key of NUMBER_FIELDS) {
    if (hanyaYangAda && !(key in data)) continue
    const v = data[key]
    hasil[key] = v === '' || v === null || v === undefined ? null : Number(v)
  }
  return hasil
}

function cekDataBarang(data) {
  const d = ambilField(data)
  if (!d.title) return 'Nama barang wajib diisi'
  if (!d.category) return 'Kategori wajib dipilih'
  if (!d.location) return 'Lokasi wajib diisi'
  if (!['pinjam', 'jual', 'keduanya'].includes(d.listing_type)) return 'Pilih jenis: pinjam, jual, atau keduanya'
  if (d.condition && !['baru', 'seperti_baru', 'baik', 'layak_pakai'].includes(d.condition)) return 'Kondisi tidak valid'

  const bisaPinjam = d.listing_type !== 'jual'
  const bisaJual = d.listing_type !== 'pinjam'
  if (bisaPinjam && !(d.rent_price_per_day > 0)) return 'Harga sewa per hari wajib diisi'
  if (bisaPinjam && !(d.retail_price > 0)) return 'Harga beli baru wajib diisi (untuk Kalkulator Hemat)'
  if (bisaJual && !(d.sale_price > 0)) return 'Harga jual wajib diisi'
  return null
}

async function hapusFoto(paths) {
  if (paths.length > 0) await supabase.storage.from('item-photos').remove(paths)
}

export async function createItem(data, files = []) {
  const { data: sesi } = await supabase.auth.getSession()
  const user = sesi.session?.user
  if (!user) return { data: null, error: 'Silakan login dulu' }

  const salah = cekDataBarang(data)
  if (salah) return { data: null, error: salah }

  if (files.length > MAX_PHOTOS) return { data: null, error: 'Maksimal 4 foto' }
  for (const file of files) {
    if (!file.type.startsWith('image/')) return { data: null, error: 'File harus berupa gambar' }
    if (file.size > MAX_PHOTO_SIZE) return { data: null, error: 'Ukuran foto maksimal 1 MB' }
  }

  const uploadedPaths = []
  const photoUrls = []
  for (const file of files) {
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`
    const { error: uploadError } = await supabase.storage.from('item-photos').upload(path, file)
    if (uploadError) {
      await hapusFoto(uploadedPaths)
      return { data: null, error: 'Gagal mengunggah foto: ' + uploadError.message }
    }
    uploadedPaths.push(path)
    photoUrls.push(supabase.storage.from('item-photos').getPublicUrl(path).data.publicUrl)
  }

  const { data: item, error } = await supabase
    .from('items')
    .insert({ ...ambilField(data), owner_id: user.id, photos: photoUrls })
    .select()
    .single()

  if (error) {
    await hapusFoto(uploadedPaths)
    return { data: null, error: error.message }
  }
  return { data: item, error: null }
}

export async function updateItem(id, data) {
  const perubahan = ambilField(data, true)
  if (['tersedia', 'nonaktif'].includes(data.status)) perubahan.status = data.status

  const { data: item, error } = await supabase
    .from('items')
    .update(perubahan)
    .eq('id', id)
    .select()
    .single()

  if (error) return { data: null, error: 'Barang tidak ditemukan atau bukan milikmu' }
  return { data: item, error: null }
}