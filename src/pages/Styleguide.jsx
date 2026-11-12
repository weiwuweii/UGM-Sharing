import { useState } from 'react'
import Buddy from '../components/buddy/Buddy'
import { BUDDY_TYPES } from '../components/buddy/buddyMap'
import BookingCard from '../components/dashboard/BookingCard'
import ReviewSheet from '../components/dashboard/ReviewSheet'
import ItemCard, { ItemCardSkeleton } from '../components/items/ItemCard'
import Badge, { BookingStatus, ItemStatus, ListingBadges } from '../components/ui/Badge'
import Button, { IconButton } from '../components/ui/Button'
import Field, { Segmented } from '../components/ui/Field'
import Icon from '../components/ui/Icon'
import Sheet from '../components/ui/Sheet'
import { EmptyState } from '../components/ui/States'
import { useToast } from '../components/ui/toast'

// Katalog komponen untuk tim (/styleguide). Semua data di halaman ini adalah contoh.

const COLORS = [
  ['navy-900', '#081A45'], ['navy-700', '#0B2A5B'], ['navy-500', '#2F4D9B'], ['violet-700', '#2A1A6B'],
  ['lime-400', '#C8F23D'], ['lime-200', '#E8FAA8'], ['bg', '#F3F6FC'], ['bg-soft', '#E8EEFB'],
  ['line', '#DCE3F2'], ['ink', '#0B1633'], ['ink-2', '#5A6788'], ['success', '#16A34A'],
  ['buddy-sky', '#5AA9FF'], ['buddy-pink', '#FF8FD0'], ['buddy-yellow', '#FFC93C'], ['buddy-coral', '#FF6B5B'], ['buddy-violet', '#7B5CFF'],
]

const SAMPLE_ITEMS = [
  { id: 'contoh-1', title: 'Kalkulator Casio fx-991EX', category: 'Kalkulator', listing_type: 'keduanya', rent_price_per_day: 8000, sale_price: 180000, location: 'FMIPA', status: 'tersedia', photos: [] },
  { id: 'contoh-2', title: 'Kamera Sony A6000 + Lensa Kit', category: 'Kamera', listing_type: 'pinjam', rent_price_per_day: 35000, location: 'FIB', status: 'tersedia', photos: [] },
  { id: 'contoh-3', title: 'Jas Lab Putih Ukuran L', category: 'Jas Lab', listing_type: 'jual', sale_price: 45000, location: 'FKH', status: 'tersedia', photos: [] },
  { id: 'contoh-4', title: 'Power Bank 20.000 mAh', category: 'Charger', listing_type: 'pinjam', rent_price_per_day: 6000, location: 'Teknik', status: 'dipinjam', photos: [] },
]

const SAMPLE_BOOKINGS = [
  { id: 'b1', type: 'pinjam', status: 'pending', start_date: '2026-11-14', end_date: '2026-11-16', saved_amount: 256000, note: 'Aku ambil di FMIPA jam 10 ya', item: { id: 'contoh-1', title: 'Kalkulator Casio fx-991EX' }, borrower: { full_name: 'Dinda' } },
  { id: 'b2', type: 'pinjam', status: 'selesai', start_date: '2026-11-08', end_date: '2026-11-09', saved_amount: 188000, item: { id: 'contoh-4', title: 'Power Bank 20.000 mAh' }, owner: { full_name: 'Raka' } },
]

function Section({ title, children }) {
  return (
    <section className="flex flex-col gap-4 border-t border-line pt-8">
      <h2 className="text-xl font-bold">{title}</h2>
      {children}
    </section>
  )
}

export default function Styleguide() {
  const [seg, setSeg] = useState('keduanya')
  const [sheet, setSheet] = useState(false)
  const [review, setReview] = useState(null)
  const [saved, setSaved] = useState({})
  const toast = useToast()

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-10 px-5 py-8 md:px-6">
      <header className="bg-hero flex flex-wrap items-center justify-between gap-4 rounded-sheet px-6 py-8 text-on-dark md:px-10">
        <div>
          <Badge tone="lime">Design system</Badge>
          <h1 className="mt-3 text-3xl font-extrabold md:text-5xl">Styleguide UGM Sharing</h1>
          <p className="mt-2 max-w-xl text-sm text-on-dark-2">Komponen siap pakai untuk semua halaman. Sumbernya file Figma, page Styleguide. Semua data di halaman ini contoh.</p>
        </div>
        <div className="flex items-end gap-2">
          {BUDDY_TYPES.map((t, i) => <Buddy key={t} type={t} size={i === 4 ? 84 : 56} />)}
        </div>
      </header>

      <Section title="Warna">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-6">
          {COLORS.map(([name, hex]) => (
            <div key={name} className="flex flex-col gap-1.5">
              <div className="h-14 rounded-field ring-1 ring-line" style={{ background: hex }} />
              <code className="text-xs font-semibold">{name}</code>
              <span className="text-xs text-ink-2">{hex}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Tipografi · Plus Jakarta Sans">
        <div className="flex flex-col gap-2">
          <p className="text-[32px] leading-10 font-extrabold">Display 32 · Pinjam dulu, beli kalau perlu</p>
          <p className="text-2xl font-bold">H1 24 · Kalkulator Casio fx-991EX</p>
          <p className="text-xl font-bold">H2 20 · Baru ditambahkan</p>
          <p className="text-base font-bold">H3 16 · Kalkulator Hemat</p>
          <p className="text-sm">Body 14 · Barang pinjaman diserahkan di titik kampus.</p>
          <p className="text-xs font-medium text-ink-2">Caption 12 · FMIPA · 300 m</p>
        </div>
      </Section>

      <Section title="Buddy (mata ikut kursor atau sentuhan)">
        <div className="flex flex-wrap items-end gap-6 rounded-card bg-surface p-6 shadow-card">
          {BUDDY_TYPES.map((t) => (
            <div key={t} className="flex flex-col items-center gap-2">
              <Buddy type={t} size={96} />
              <code className="text-xs">{`<Buddy type="${t}" />`}</code>
            </div>
          ))}
        </div>
        <p className="text-sm text-ink-2">Pakai <code>{"buddyForCategory(`${item.category} ${item.title}`)"}</code> untuk memilih maskot dari kategori dan judul barang. Pupil diam kalau pengguna mengaktifkan reduced motion.</p>
      </Section>

      <Section title="Tombol">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Ajukan Pinjam</Button>
          <Button variant="secondary">Kembali</Button>
          <Button variant="dark">Hubungi via WhatsApp</Button>
          <Button variant="ghost">Lihat semua</Button>
          <Button variant="danger">Batalkan request</Button>
          <Button loading>Mengirim</Button>
          <Button size="sm">Kecil</Button>
          <IconButton label="Simpan"><Icon name="heart" /></IconButton>
          <IconButton label="Kembali"><Icon name="arrowLeft" /></IconButton>
        </div>
      </Section>

      <Section title="Badge dan status">
        <div className="flex flex-wrap items-center gap-3">
          <ListingBadges listingType="keduanya" status="tersedia" />
          <ListingBadges listingType="pinjam" status="dipinjam" />
          {['pending', 'disetujui', 'ditolak', 'dibatalkan', 'selesai'].map((s) => <BookingStatus key={s} status={s} />)}
          {['tersedia', 'dipinjam', 'terjual', 'nonaktif'].map((s) => <ItemStatus key={s} status={s} />)}
        </div>
      </Section>

      <Section title="Form">
        <div className="grid max-w-3xl gap-4 md:grid-cols-2">
          <div className="md:col-span-2"><Segmented label="Jenis listing" options={[{ value: 'pinjam', label: 'Pinjam' }, { value: 'jual', label: 'Jual' }, { value: 'keduanya', label: 'Keduanya' }]} value={seg} onChange={setSeg} /></div>
          <Field id="sg-sewa" label="Harga sewa per hari" prefix="Rp" inputMode="numeric" defaultValue="8.000" />
          <Field id="sg-jual" label="Harga jual" prefix="Rp" inputMode="numeric" placeholder="180.000" hint="Kosongkan kalau hanya dipinjamkan" />
          <Field id="sg-email" label="Email UGM" type="email" defaultValue="dinda@gmail.com" error="Gunakan email UGM (@mail.ugm.ac.id atau @ugm.ac.id)" />
          <Field id="sg-kat" as="select" label="Kategori" defaultValue="Kalkulator">
            <option>Kalkulator</option><option>Kamera</option><option>Charger</option><option>Jas Lab</option><option>Lainnya</option>
          </Field>
          <Field id="sg-desk" as="textarea" className="md:col-span-2" label="Deskripsi" placeholder="Kondisi, kelengkapan, dan lokasi serah-terima" />
        </div>
      </Section>

      <Section title="Kartu barang">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
          {SAMPLE_ITEMS.map((it) => (
            <ItemCard key={it.id} item={it} saved={!!saved[it.id]} onToggleSaved={(x) => setSaved((s) => ({ ...s, [x.id]: !s[x.id] }))} />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6"><ItemCardSkeleton /><ItemCardSkeleton /></div>
      </Section>

      <Section title="Kartu request (Dashboard)">
        <div className="grid items-start gap-3 md:grid-cols-2">
          <BookingCard booking={SAMPLE_BOOKINGS[0]} role="owner" onStatus={(_, s) => toast(`Contoh: status jadi ${s}`)} onReview={() => {}} />
          <BookingCard booking={SAMPLE_BOOKINGS[1]} role="borrower" onStatus={() => {}} onReview={(b, who) => setReview({ b, who })} />
        </div>
      </Section>

      <Section title="Sheet, toast, empty state">
        <div className="flex flex-wrap gap-3">
          <Button variant="dark" onClick={() => setSheet(true)}>Buka sheet</Button>
          <Button variant="secondary" onClick={() => toast('Request disetujui')}>Toast sukses</Button>
          <Button variant="secondary" onClick={() => toast('Tanggal sudah dipakai orang lain', 'error')}>Toast error</Button>
        </div>
        <div className="max-w-md">
          <EmptyState buddy="charger" title="Belum ada request masuk" action={<Button>Pasang barang</Button>}>
            Request pinjam atau beli untuk barangmu akan muncul di sini.
          </EmptyState>
        </div>
      </Section>

      <Sheet
        open={sheet}
        onClose={() => setSheet(false)}
        title="Contoh sheet"
        description="Di HP muncul dari bawah, di desktop di tengah layar."
        footer={<Button full onClick={() => setSheet(false)}>Mengerti</Button>}
      >
        <p className="text-sm text-ink-2">Tekan Esc, klik latar gelap, atau tombol X untuk menutup.</p>
      </Sheet>
      <ReviewSheet booking={review?.b} counterpart={review?.who} onClose={() => setReview(null)} />
    </div>
  )
}
