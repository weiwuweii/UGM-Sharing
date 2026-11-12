// Format angka dan tanggal yang dipakai di seluruh UI.

const rupiahFmt = new Intl.NumberFormat('id-ID')

export function rupiah(n) {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return '-'
  return 'Rp' + rupiahFmt.format(Math.round(Number(n)))
}

// "Rp12,4 jt" untuk angka besar di kartu statistik
export function rupiahRingkas(n) {
  const v = Number(n) || 0
  if (v >= 1_000_000) return 'Rp' + (v / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + ' jt'
  return rupiah(v)
}

const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

function parseTanggal(s) {
  // "YYYY-MM-DD" dibaca sebagai tanggal lokal, bukan UTC
  const [y, m, d] = String(s).split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function jumlahHari(start, end) {
  if (!start || !end) return 0
  const ms = parseTanggal(end) - parseTanggal(start)
  return Math.round(ms / 86_400_000) + 1
}

// "14-16 Nov · 3 hari" atau "30 Nov - 2 Des · 3 hari"
export function rentangTanggal(start, end) {
  if (!start) return ''
  const a = parseTanggal(start)
  const b = parseTanggal(end || start)
  const hari = jumlahHari(start, end || start)
  let teks
  if (hari <= 1) teks = `${a.getDate()} ${BULAN[a.getMonth()]}`
  else if (a.getMonth() === b.getMonth()) teks = `${a.getDate()}-${b.getDate()} ${BULAN[b.getMonth()]}`
  else teks = `${a.getDate()} ${BULAN[a.getMonth()]} - ${b.getDate()} ${BULAN[b.getMonth()]}`
  return `${teks} · ${hari} hari`
}

export function tanggalPendek(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`
}
