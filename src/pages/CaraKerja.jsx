import Buddy from '../components/buddy/Buddy'
import Button from '../components/ui/Button'
import Icon from '../components/ui/Icon'
import { rupiah } from '../lib/format'
import { ATURAN, FAQ, LANGKAH_PEMILIK, LANGKAH_PEMINJAM } from '../content/caraKerja'

// Contoh angka untuk penjelasan Kalkulator Hemat
const CONTOH = { beliBaru: 250000, sewaPerHari: 10000, hari: 3 }
const biayaPinjam = CONTOH.sewaPerHari * CONTOH.hari
const hemat = CONTOH.beliBaru - biayaPinjam
const impas = Math.ceil(CONTOH.beliBaru / CONTOH.sewaPerHari)

// Halaman Cara Kerja (konten oleh A): alur, Kalkulator Hemat, aturan, dan FAQ.
export default function CaraKerja() {
  return (
    <div>
      <section className="bg-hero text-on-dark">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-4 px-5 py-12 text-center md:flex-row md:justify-between md:px-6 md:py-16 md:text-left">
          <div className="max-w-xl">
            <p className="text-sm font-semibold text-lime-400">Cara Kerja</p>
            <h1 className="mt-2 text-3xl font-extrabold md:text-4xl">Pinjam barang kuliah, tanpa beli baru</h1>
            <p className="mt-3 text-on-dark-2">Dari mahasiswa, untuk mahasiswa UGM. Empat langkah dan kamu sudah bisa pinjam, atau mulai menyewakan barang yang jarang dipakai.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3 md:justify-start">
              <Button to="/katalog">Cari Barang</Button>
              <Button variant="secondary" to="/pasang">Pasang Barang</Button>
            </div>
          </div>
          <Buddy type="jaslab" size={170} />
        </div>
      </section>

      <div className="mx-auto flex max-w-[1200px] flex-col gap-14 px-5 py-12 md:px-6 md:py-16">
        <section aria-labelledby="peminjam">
          <h2 id="peminjam" className="text-2xl font-bold">Kalau kamu mau pinjam</h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {LANGKAH_PEMINJAM.map((l, i) => (
              <li key={l.judul} className="flex flex-col gap-3 rounded-card bg-surface p-5 shadow-card">
                <div className="flex items-center justify-between">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-lime-400 text-sm font-bold text-navy-900">{i + 1}</span>
                  <Buddy type={l.buddy} size={56} />
                </div>
                <h3 className="font-bold">{l.judul}</h3>
                <p className="text-sm text-ink-2">{l.teks}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="hemat" className="grid gap-6 rounded-sheet bg-navy-700 p-6 text-on-dark md:grid-cols-2 md:p-10">
          <div>
            <p className="text-sm font-semibold text-lime-400">Kalkulator Hemat</p>
            <h2 id="hemat" className="mt-1 text-2xl font-bold">Lihat hematnya sebelum memutuskan</h2>
            <p className="mt-3 text-on-dark-2">Di setiap barang, kamu langsung tahu selisih biaya pinjam dan harga beli baru, plus berapa hari sampai pinjam jadi lebih mahal dari beli.</p>
          </div>
          <dl className="grid gap-2.5 rounded-card bg-navy-900 p-5 text-sm">
            <p className="font-semibold">Contoh: kalkulator ilmiah, pinjam {CONTOH.hari} hari</p>
            <Baris label="Harga beli baru" nilai={rupiah(CONTOH.beliBaru)} />
            <Baris label={`Biaya pinjam (${CONTOH.hari} × ${rupiah(CONTOH.sewaPerHari)})`} nilai={rupiah(biayaPinjam)} />
            <Baris label="Kamu hemat" nilai={rupiah(hemat)} tebal />
            <p className="text-on-dark-2">Titik impas: {impas} hari. Pinjam lebih murah selama kurang dari itu.</p>
          </dl>
        </section>

        <section aria-labelledby="pemilik">
          <h2 id="pemilik" className="text-2xl font-bold">Kalau kamu mau menyewakan</h2>
          <p className="mt-1 text-ink-2">Punya barang yang jarang dipakai? Biarkan dia bekerja untukmu.</p>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {LANGKAH_PEMILIK.map((l, i) => (
              <li key={l.judul} className="rounded-card bg-tint-blue p-5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-700 text-sm font-bold text-on-dark">{i + 1}</span>
                <h3 className="mt-3 font-bold">{l.judul}</h3>
                <p className="mt-1 text-sm text-ink-2">{l.teks}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="aturan">
          <h2 id="aturan" className="text-2xl font-bold">Aturan main</h2>
          <p className="mt-1 text-ink-2">Singkat, supaya semua nyaman dan aman.</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {ATURAN.map((a) => (
              <article key={a.judul} className="rounded-card bg-surface p-5 shadow-card">
                <h3 className="flex items-center gap-2 font-bold"><Icon name="check" size={18} className="text-navy-500" />{a.judul}</h3>
                <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-sm text-ink-2">
                  {a.butir.map((b) => <li key={b}>{b}</li>)}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="faq" className="mx-auto w-full max-w-3xl">
          <h2 id="faq" className="text-2xl font-bold">Pertanyaan umum</h2>
          <div className="mt-6 flex flex-col gap-3">
            {FAQ.map((f) => (
              <details key={f.t} className="group rounded-card bg-surface p-4 shadow-card">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold">
                  {f.t}
                  <Icon name="plus" size={18} className="transition group-open:rotate-45" />
                </summary>
                <p className="mt-2 text-sm text-ink-2">{f.j}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="flex flex-col items-center gap-3 rounded-sheet bg-lime-200 p-8 text-center">
          <Buddy type="kamera" size={90} />
          <h2 className="text-2xl font-bold">Siap mulai hemat?</h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Button variant="dark" to="/katalog">Jelajahi Katalog</Button>
            <Button variant="secondary" to="/masuk">Masuk atau Daftar</Button>
          </div>
        </section>
      </div>
    </div>
  )
}

function Baris({ label, nilai, tebal = false }) {
  return (
    <div className={`flex justify-between gap-4 ${tebal ? 'font-bold text-lime-400' : ''}`}>
      <dt>{label}</dt>
      <dd>{nilai}</dd>
    </div>
  )
}
