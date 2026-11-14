// Bantuan tanggal untuk kalender ketersediaan dan Ajukan Pinjam.

// Tanggal lokal jadi teks "YYYY-MM-DD"
export function iso(d) {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const t = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${t}`
}

// Semua tanggal dari start sampai end, termasuk kedua ujung
export function tanggalDalamRentang(start, end = start) {
  const [y, m, d] = start.split('-').map(Number)
  const hasil = []
  for (let i = 0; i < 400; i++) {
    const t = iso(new Date(y, m - 1, d + i))
    hasil.push(t)
    if (t >= end) break
  }
  return hasil
}
