import Button from '../ui/Button'
import Field from '../ui/Field'

// PENTING: 'value' harus PERSIS sama dengan isi database (getItems memakai pencocokan persis).
// Ganti sesuai hasil "select distinct" dari D.
const KATEGORI = [
  { value: 'kalkulator', label: 'Kalkulator' },
  { value: 'kamera', label: 'Kamera' },
  { value: 'charger', label: 'Charger' },
  { value: 'jas lab', label: 'Jas Lab' },
]
const LOKASI = [
  { value: 'FMIPA', label: 'FMIPA' },
  { value: 'Teknik', label: 'Teknik' },
  { value: 'Sekip', label: 'Sekip' },
]
const KONDISI = [
  { value: '', label: 'Semua kondisi' },
  { value: 'baru', label: 'Baru' },
  { value: 'seperti_baru', label: 'Seperti baru' },
  { value: 'baik', label: 'Baik' },
  { value: 'layak_pakai', label: 'Layak pakai' },
]

function Judul({ children }) {
  return <h3 className="mb-2 text-base font-bold">{children}</h3>
}

// Baris dengan kotak centang membulat (20x20, radius token chip), sesuai Figma
function Kotak({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 py-1.5 text-[15px]">
      <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        aria-hidden="true"
        className={`flex size-5 shrink-0 items-center justify-center rounded-chip transition peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-navy-500 ${
          checked ? 'bg-navy-700 text-lime-400' : 'bg-surface ring-2 ring-line ring-inset'
        }`}
      >
        {checked && (
          <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m5 12 5 5L20 7" />
          </svg>
        )}
      </span>
      {label}
    </label>
  )
}

// Daftar centang yang hanya boleh satu aktif (API hanya menerima satu nilai)
function PilihSatu({ opsi, nilai, onChange }) {
  return (
    <div>
      {opsi.map((o) => (
        <Kotak
          key={o.value}
          label={o.label}
          checked={nilai === o.value}
          onChange={() => onChange(nilai === o.value ? '' : o.value)}
        />
      ))}
    </div>
  )
}

export default function FilterPanel({ filters, ubah, harga, onReset }) {
  // Tipe: kosong = keduanya tercentang
  const pinjamOn = filters.type === '' || filters.type === 'pinjam'
  const beliOn = filters.type === '' || filters.type === 'jual'

  function ubahTipe(yang) {
    const pinjam = yang === 'pinjam' ? !pinjamOn : pinjamOn
    const beli = yang === 'beli' ? !beliOn : beliOn
    ubah('type', pinjam && !beli ? 'pinjam' : beli && !pinjam ? 'jual' : '')
  }

  function terapkanHarga() {
    ubah('minPrice', harga.min)
    ubah('maxPrice', harga.max)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Filter</h2>
        <button type="button" onClick={onReset} className="text-sm font-semibold text-navy-500 hover:underline">
          Reset
        </button>
      </div>

      <div>
        <Judul>Tipe</Judul>
        <Kotak label="Pinjam" checked={pinjamOn} onChange={() => ubahTipe('pinjam')} />
        <Kotak label="Beli" checked={beliOn} onChange={() => ubahTipe('beli')} />
      </div>

      <div>
        <Judul>Kategori</Judul>
        <PilihSatu opsi={KATEGORI} nilai={filters.category} onChange={(v) => ubah('category', v)} />
      </div>

      <div>
        <Judul>Harga sewa per hari</Judul>
        <div className="flex gap-2">
          <Field
            label="Min"
            type="number"
            inputMode="numeric"
            min="0"
            prefix="Rp"
            value={harga.min}
            onChange={(e) => harga.setMin(e.target.value)}
            onBlur={terapkanHarga}
            onKeyDown={(e) => e.key === 'Enter' && terapkanHarga()}
          />
          <Field
            label="Maks"
            type="number"
            inputMode="numeric"
            min="0"
            prefix="Rp"
            value={harga.max}
            onChange={(e) => harga.setMax(e.target.value)}
            onBlur={terapkanHarga}
            onKeyDown={(e) => e.key === 'Enter' && terapkanHarga()}
          />
        </div>
      </div>

      <div>
        <Judul>Lokasi</Judul>
        <PilihSatu opsi={LOKASI} nilai={filters.location} onChange={(v) => ubah('location', v)} />
      </div>

      <Field as="select" label="Kondisi" value={filters.condition} onChange={(e) => ubah('condition', e.target.value)}>
        {KONDISI.map((k) => (
          <option key={k.value} value={k.value}>{k.label}</option>
        ))}
      </Field>

      <Kotak
        label="Hanya yang tersedia"
        checked={filters.available}
        onChange={(e) => ubah('available', e.target.checked ? '1' : '')}
      />
    </div>
  )
}