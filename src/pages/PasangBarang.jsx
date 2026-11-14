import { useEffect, useRef, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import Buddy from '../components/buddy/Buddy'
import Button from '../components/ui/Button'
import Field, { Segmented } from '../components/ui/Field'
import Icon from '../components/ui/Icon'
import { useToast } from '../components/ui/toast'
import { KATEGORI, KONDISI, LOKASI } from '../content/pilihan'
import { createItem } from '../lib/api'
import { rupiah } from '../lib/format'
import { kompresFoto } from '../lib/kompresFoto'
import { useSession } from '../lib/useSession'

const MAX_FOTO = 4
const KOSONG = {
  title: '', description: '', category: '', listing_type: 'pinjam', condition: 'baik', location: '',
  retail_price: '', rent_price_per_day: '', sale_price: '', deposit: '',
}

// Pasang Barang (F4): foto, info barang, harga, lalu terbit.
export default function PasangBarang() {
  const { user, loading } = useSession()
  const toast = useToast()
  const inputFoto = useRef(null)
  const [form, setForm] = useState(KOSONG)
  const [foto, setFoto] = useState([]) // { file, url }
  const [errors, setErrors] = useState({})
  const [memproses, setMemproses] = useState(false)
  const [mengirim, setMengirim] = useState(false)
  const [hasil, setHasil] = useState(null)

  // Bersihkan URL pratinjau foto saat halaman ditutup
  const fotoRef = useRef(foto)
  useEffect(() => {
    fotoRef.current = foto
  }, [foto])
  useEffect(() => () => fotoRef.current.forEach((f) => URL.revokeObjectURL(f.url)), [])

  if (!loading && !user) return <Navigate to="/masuk?next=/pasang" replace />

  const bisaPinjam = form.listing_type !== 'jual'
  const bisaJual = form.listing_type !== 'pinjam'

  const ubah = (k) => (e) => {
    const v = e?.target ? e.target.value : e
    setForm((f) => ({ ...f, [k]: v }))
    setErrors((er) => ({ ...er, [k]: null }))
  }
  const angka = (k) => (e) => ubah(k)(e.target.value.replace(/\D/g, ''))

  async function tambahFoto(e) {
    const files = Array.from(e.target.files ?? []).slice(0, MAX_FOTO - foto.length)
    e.target.value = ''
    if (!files.length) return
    setMemproses(true)
    const baru = []
    for (const f of files) {
      try {
        const kecil = await kompresFoto(f)
        baru.push({ file: kecil, url: URL.createObjectURL(kecil) })
      } catch (err) {
        toast(err.message, 'error')
      }
    }
    setFoto((list) => [...list, ...baru])
    setErrors((er) => ({ ...er, foto: null }))
    setMemproses(false)
  }

  function hapusFoto(i) {
    setFoto((list) => {
      URL.revokeObjectURL(list[i].url)
      return list.filter((_, j) => j !== i)
    })
  }

  function validasi() {
    const er = {}
    if (form.title.trim().length < 3) er.title = 'Nama barang minimal 3 huruf'
    if (!form.category) er.category = 'Pilih kategori'
    if (!form.location) er.location = 'Pilih lokasi serah terima'
    if (bisaPinjam && !(Number(form.rent_price_per_day) > 0)) er.rent_price_per_day = 'Isi harga sewa per hari'
    if (bisaPinjam && !(Number(form.retail_price) > 0)) er.retail_price = 'Isi harga beli baru, dipakai untuk Kalkulator Hemat'
    if (bisaJual && !(Number(form.sale_price) > 0)) er.sale_price = 'Isi harga jual'
    if (foto.length === 0) er.foto = 'Tambahkan minimal 1 foto'
    setErrors(er)
    return Object.keys(er).length === 0
  }

  async function kirim(e) {
    e.preventDefault()
    if (!validasi()) {
      toast('Masih ada yang perlu dilengkapi', 'error')
      return
    }
    setMengirim(true)
    const data = {
      ...form,
      sale_price: bisaJual ? form.sale_price : null,
      rent_price_per_day: bisaPinjam ? form.rent_price_per_day : null,
      retail_price: form.retail_price || null,
      deposit: bisaPinjam ? form.deposit || 0 : 0,
    }
    const res = await createItem(data, foto.map((f) => f.file))
    setMengirim(false)
    if (res.error) {
      toast(res.error, 'error')
      return
    }
    setHasil(res.data)
  }

  if (hasil) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-5 py-16 text-center">
        <Buddy type="charger" size={150} />
        <h1 className="text-2xl font-bold">Barangmu sudah tayang!</h1>
        <p className="text-sm text-ink-2">Request yang masuk akan muncul di Dashboard. Pastikan nomor WhatsApp di Profil sudah terisi.</p>
        <div className="flex w-full flex-col gap-3">
          <Button full to={`/barang/${hasil.id}`}>Lihat Barang</Button>
          <Button full variant="secondary" onClick={() => { setHasil(null); setForm(KOSONG); setFoto([]) }}>Pasang Barang Lain</Button>
        </div>
      </div>
    )
  }

  const hemat = bisaPinjam && Number(form.retail_price) > 0 && Number(form.rent_price_per_day) > 0
    ? Math.ceil(Number(form.retail_price) / Number(form.rent_price_per_day))
    : null

  return (
    <div className="mx-auto max-w-2xl px-5 py-8 md:py-12">
      <h1 className="text-2xl font-bold md:text-3xl">Pasang Barang</h1>
      <p className="mt-1 text-sm text-ink-2">Barang yang jarang dipakai bisa jadi pemasukan. Isi sekali, langsung tayang di Katalog.</p>

      <form onSubmit={kirim} noValidate className="mt-6 flex flex-col gap-6">
        <Bagian nomor={1} judul="Foto barang" catatan={`Maksimal ${MAX_FOTO} foto. Foto pertama jadi sampul.`}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {foto.map((f, i) => (
              <div key={f.url} className="relative aspect-square overflow-hidden rounded-field bg-bg-soft">
                <img src={f.url} alt={`Foto ${i + 1}`} className="size-full object-cover" />
                {i === 0 && <span className="absolute bottom-1.5 left-1.5 rounded-full bg-navy-900/80 px-2 py-0.5 text-[11px] font-semibold text-on-dark">Sampul</span>}
                <button type="button" onClick={() => hapusFoto(i)} aria-label={`Hapus foto ${i + 1}`} className="absolute top-1.5 right-1.5 inline-flex size-7 items-center justify-center rounded-full bg-surface shadow-card">
                  <Icon name="x" size={14} />
                </button>
              </div>
            ))}
            {foto.length < MAX_FOTO && (
              <button
                type="button"
                onClick={() => inputFoto.current?.click()}
                disabled={memproses}
                className={`flex aspect-square flex-col items-center justify-center gap-1.5 rounded-field border-2 border-dashed text-sm font-semibold text-navy-500 transition hover:bg-tint-blue ${errors.foto ? 'border-danger' : 'border-line'}`}
              >
                <Icon name="plus" size={22} />
                {memproses ? 'Memproses...' : 'Tambah foto'}
              </button>
            )}
          </div>
          {/* accept image/* membuka pilihan kamera atau galeri di HP */}
          <input ref={inputFoto} type="file" accept="image/*" multiple hidden onChange={tambahFoto} />
          {errors.foto && <p className="text-xs text-danger">{errors.foto}</p>}
        </Bagian>

        <Bagian nomor={2} judul="Info barang">
          <Field label="Nama barang" value={form.title} onChange={ubah('title')} error={errors.title} placeholder="Contoh: Kalkulator Casio fx-991ID Plus" maxLength={80} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field as="select" label="Kategori" value={form.category} onChange={ubah('category')} error={errors.category}>
              <option value="">Pilih kategori</option>
              {KATEGORI.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
            </Field>
            <Field as="select" label="Kondisi" value={form.condition} onChange={ubah('condition')}>
              {KONDISI.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
            </Field>
          </div>
          <Field as="select" label="Lokasi serah terima" value={form.location} onChange={ubah('location')} error={errors.location}>
            <option value="">Pilih lokasi</option>
            {LOKASI.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
          </Field>
          <Field as="textarea" label="Deskripsi (opsional)" value={form.description} onChange={ubah('description')} placeholder="Kelengkapan, minus, atau catatan pemakaian" maxLength={500} />
        </Bagian>

        <Bagian nomor={3} judul="Harga">
          <Segmented
            label="Jenis penawaran"
            options={[{ value: 'pinjam', label: 'Pinjam' }, { value: 'jual', label: 'Jual' }, { value: 'keduanya', label: 'Keduanya' }]}
            value={form.listing_type}
            onChange={ubah('listing_type')}
          />
          {bisaPinjam && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Harga sewa per hari" prefix="Rp" inputMode="numeric" value={form.rent_price_per_day} onChange={angka('rent_price_per_day')} error={errors.rent_price_per_day} placeholder="10000" />
              <Field label="Deposit (opsional)" prefix="Rp" inputMode="numeric" value={form.deposit} onChange={angka('deposit')} placeholder="0" />
            </div>
          )}
          <Field
            label={bisaPinjam ? 'Harga beli baru' : 'Harga beli baru (opsional)'}
            prefix="Rp"
            inputMode="numeric"
            value={form.retail_price}
            onChange={angka('retail_price')}
            error={errors.retail_price}
            placeholder="250000"
            hint={hemat ? `Peminjam hemat sampai ${hemat - 1} hari pinjam dibanding beli baru.` : 'Dipakai Kalkulator Hemat untuk menunjukkan hematnya peminjam.'}
          />
          {bisaJual && (
            <Field label="Harga jual" prefix="Rp" inputMode="numeric" value={form.sale_price} onChange={angka('sale_price')} error={errors.sale_price} placeholder="150000" hint={form.sale_price ? rupiah(Number(form.sale_price)) : undefined} />
          )}
        </Bagian>

        <Button type="submit" full loading={mengirim}>Terbitkan Barang</Button>
        <p className="text-center text-xs text-ink-2">
          Dengan menerbitkan, kamu setuju dengan <Link to="/cara-kerja" className="font-semibold text-navy-500 underline">aturan main</Link>.
        </p>
      </form>
    </div>
  )
}

function Bagian({ nomor, judul, catatan, children }) {
  return (
    <section className="flex flex-col gap-4 rounded-card bg-surface p-5 shadow-card md:p-6">
      <div className="flex items-center gap-3">
        <span className="flex size-8 items-center justify-center rounded-full bg-lime-400 text-sm font-bold text-navy-900">{nomor}</span>
        <div>
          <h2 className="font-bold">{judul}</h2>
          {catatan && <p className="text-xs text-ink-2">{catatan}</p>}
        </div>
      </div>
      {children}
    </section>
  )
}
