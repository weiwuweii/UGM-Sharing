// Pemetaan kategori barang ke maskot Buddy dan warna latarnya.

export const BUDDY_TYPES = ['kalkulator', 'kamera', 'charger', 'jaslab', 'violet']

// Warna latar (tint) per tipe, untuk kartu barang dan chip kategori
export const BUDDY_TINT = {
  kalkulator: 'bg-tint-blue',
  kamera: 'bg-tint-pink',
  charger: 'bg-tint-yellow',
  jaslab: 'bg-tint-coral',
  violet: 'bg-tint-violet',
}

// Kategori (dan boleh ditambah judul barang) dipetakan ke maskot.
// Contoh: buddyForCategory(`${item.category} ${item.title}`)
export function buddyForCategory(category = '') {
  const c = String(category ?? '').toLowerCase()
  if (c.includes('kalkulator')) return 'kalkulator'
  if (c.includes('kamera') || c.includes('foto')) return 'kamera'
  if (c.includes('charger') || c.includes('power') || c.includes('elektronik') || c.includes('kabel')) return 'charger'
  if (c.includes('jas') || c.includes('lab') || c.includes('pakaian')) return 'jaslab'
  return 'violet'
}
