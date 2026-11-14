import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../ui/Button'
import Field from '../ui/Field'
import Icon from '../ui/Icon'
import Sheet from '../ui/Sheet'
import { useToast } from '../ui/toast'
import { createBooking } from '../../lib/api'
import { jumlahHari, rupiah } from '../../lib/format'
import { hematBeli, hitungHemat } from '../../lib/hemat'
import KalenderTanggal, { tanggalDalamRentang } from './KalenderTanggal'

const NAMA_HARI = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
const NAMA_BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

// "2026-11-14" jadi "Sab, 14 Nov"
function hariPendek(t) {
  const [y, m, d] = t.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  return `${NAMA_HARI[dt.getDay()]}, ${d} ${NAMA_BULAN[m - 1]}`
}

// mode: 'pinjam' (pilih tanggal) atau 'beli' (tanpa tanggal)
export default function AjukanSheet({ open, onClose, item, mode }) {
  const navigate = useNavigate()
  const toast = useToast()
  const [mulai, setMulai] = useState(null)
  const [selesai, setSelesai] = useState(null)
  const [catatan, setCatatan] = useState('')
  const [kirim, setKirim] = useState(false)
  const [error, setError] = useState(null)

  const pinjam = mode === 'pinjam'

  // Semua tanggal yang sudah dipesan orang lain
  const terpakai = useMemo(() => {
    const s = new Set()
    for (const r of item.booked_ranges ?? []) {
      if (!r?.start_date) continue
      tanggalDalamRentang(r.start_date, r.end_date ?? r.start_date).forEach((t) => s.add(t))
    }
    return s
  }, [item])

  // Klik pertama = tanggal mulai, klik kedua = tanggal selesai, klik berikutnya mengulang
  function pilih(t) {
    setError(null)
    if (!mulai || selesai || t < mulai) {
      setMulai(t)
      setSelesai(null)
      return
    }
    const bentrok = tanggalDalamRentang(mulai, t).some((x) => terpakai.has(x))
    if (bentrok) {
      setMulai(t)
      setSelesai(null)
    } else {
      setSelesai(t)
    }
  }

  const akhir = selesai ?? mulai
  const hari = mulai ? jumlahHari(mulai, akhir) : 0
  const biaya = pinjam ? hari * item.rent_price_per_day : item.sale_price
  const deposit = pinjam ? item.deposit ?? 0 : 0
  const hemat = pinjam
    ? hitungHemat({ retail: item.retail_price, sewaPerHari: item.rent_price_per_day, hari }).hemat
    : hematBeli(item.retail_price, item.sale_price)

  async function kirimRequest() {
    setKirim(true)
    setError(null)
    const res = pinjam
      ? await createBooking(item.id, 'pinjam', mulai, akhir, catatan.trim())
      : await createBooking(item.id, 'beli', null, null, catatan.trim())
    setKirim(false)
    if (res.error) {
      setError(res.error) // tampilkan pesan dari server apa adanya
      return
    }
    toast('Request terkirim. Tunggu persetujuan pemilik ya.')
    onClose()
    navigate('/dashboard')
  }

  const perluLogin = error && /login/i.test(error)
  const deskripsi = pinjam
    ? `${item.title} · ${rupiah(item.rent_price_per_day)}/hari · pemilik: ${item.owner?.full_name ?? '-'}`
    : `${item.title} · ${rupiah(item.sale_price)} · pemilik: ${item.owner?.full_name ?? '-'}`

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={pinjam ? 'Ajukan pinjam' : 'Ajukan beli'}
      description={deskripsi}
      footer={
        <Button full loading={kirim} disabled={pinjam && !mulai} onClick={kirimRequest}>
          Kirim request
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        {pinjam && (
          <>
            <KalenderTanggal terpakai={terpakai} mulai={mulai} selesai={selesai} onPilih={pilih} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Mulai" readOnly value={mulai ? hariPendek(mulai) : ''} placeholder="Pilih tanggal" />
              <Field label="Selesai" readOnly value={akhir ? hariPendek(akhir) : ''} placeholder="Pilih tanggal" />
            </div>
          </>
        )}

        <Field
          label="Catatan untuk pemilik"
          placeholder="Contoh: Aku ambil di FMIPA jam 10 ya"
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
        />

        {(!pinjam || mulai) && (
          <div className="flex flex-col gap-2 rounded-field bg-bg p-4 text-sm">
            <div className="flex justify-between text-ink-2">
              <span>{pinjam ? `Biaya pinjam (${hari} hari)` : 'Harga beli'}</span>
              <span className="tabular text-ink">{rupiah(biaya)}</span>
            </div>
            {pinjam && (
              <div className="flex justify-between text-ink-2">
                <span>Deposit (dikembalikan)</span>
                <span className="tabular text-ink">{rupiah(deposit)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold">
              <span>Dibayar saat serah-terima</span>
              <span className="tabular text-base text-navy-700">{rupiah(biaya + deposit)}</span>
            </div>
          </div>
        )}

        {hemat > 0 && (!pinjam || mulai) && (
          <p className="rounded-field bg-lime-400 px-4 py-3 text-sm font-semibold">
            Kamu hemat {rupiah(hemat)} dibanding beli baru
          </p>
        )}

        <p className="flex items-start gap-2 text-xs text-ink-2">
          <Icon name="lock" size={14} className="mt-0.5" />
          Nomor WhatsApp pemilik terbuka setelah request disetujui.
        </p>

        {error && (
          <div role="alert" className="flex flex-col items-start gap-2 text-sm text-danger">
            <p>{error}</p>
            {perluLogin && <Button size="sm" variant="secondary" to="/masuk">Masuk</Button>}
          </div>
        )}
      </div>
    </Sheet>
  )
}