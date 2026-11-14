import { useState } from 'react'
import Icon from '../ui/Icon'

const HARI = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

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

// terpakai: Set tanggal yang sudah dipesan. mulai/selesai: tanggal terpilih ("YYYY-MM-DD" atau null).
export default function KalenderTanggal({ terpakai, mulai, selesai, onPilih }) {
  const sekarang = new Date()
  const hariIni = iso(sekarang)
  const [tampil, setTampil] = useState({ y: sekarang.getFullYear(), m: sekarang.getMonth() })
  const { y, m } = tampil

  const offset = (new Date(y, m, 1).getDay() + 6) % 7 // minggu mulai hari Senin
  const jumlah = new Date(y, m + 1, 0).getDate()
  const sel = [...Array(offset).fill(null), ...Array.from({ length: jumlah }, (_, i) => i + 1)]
  const bisaMundur = y * 12 + m > sekarang.getFullYear() * 12 + sekarang.getMonth()

  function geser(arah) {
    const baru = new Date(y, m + arah, 1)
    setTampil({ y: baru.getFullYear(), m: baru.getMonth() })
  }

  const akhir = selesai ?? mulai

  return (
    <div className="rounded-card bg-bg p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Bulan sebelumnya"
            disabled={!bisaMundur}
            onClick={() => geser(-1)}
            className="inline-flex size-8 items-center justify-center rounded-full hover:bg-bg-soft disabled:opacity-30"
          >
            <Icon name="arrowLeft" size={16} />
          </button>
          <h3 className="min-w-32 text-center text-base font-bold">{BULAN[m]} {y}</h3>
          <button
            type="button"
            aria-label="Bulan berikutnya"
            onClick={() => geser(1)}
            className="inline-flex size-8 items-center justify-center rounded-full hover:bg-bg-soft"
          >
            <Icon name="arrowRight" size={16} />
          </button>
        </div>
        <div className="flex items-center gap-3 text-xs text-ink-2">
          <span className="flex items-center gap-1"><span className="size-2.5 rounded-sm bg-navy-700" />Dipilih</span>
          <span className="flex items-center gap-1"><span className="size-2.5 rounded-sm bg-bg-soft ring-1 ring-line" />Terpakai</span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {HARI.map((h) => (
          <span key={h} className="pb-1 text-xs text-ink-2">{h}</span>
        ))}
        {sel.map((d, i) => {
          if (d === null) return <span key={`kosong-${i}`} />
          const t = iso(new Date(y, m, d))
          const lewat = t < hariIni
          const dipakai = terpakai.has(t)
          const dipilih = mulai && t >= mulai && t <= akhir
          let gaya = 'hover:bg-bg-soft'
          if (dipilih) gaya = 'bg-navy-700 font-semibold text-on-dark'
          else if (dipakai) gaya = 'bg-bg-soft text-ink-2/60'
          else if (lewat) gaya = 'text-ink-2/40'
          return (
            <button
              key={t}
              type="button"
              disabled={lewat || dipakai}
              aria-pressed={!!dipilih}
              aria-label={`${d} ${BULAN[m]} ${y}${dipakai ? ', sudah terpakai' : ''}`}
              onClick={() => onPilih(t)}
              className={`tabular h-10 rounded-chip text-sm transition disabled:cursor-not-allowed ${gaya}`}
            >
              {d}
            </button>
          )
        })}
      </div>
    </div>
  )
}