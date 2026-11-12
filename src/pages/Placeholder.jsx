import Buddy from '../components/buddy/Buddy'
import Button from '../components/ui/Button'

// Penanda halaman yang sedang dikerjakan anggota lain.
// Ganti elemen route-nya di App.jsx dengan halaman asli saat sudah jadi.
export default function Placeholder({ title, owner, buddy = 'violet' }) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-3 px-5 py-16 text-center">
      <Buddy type={buddy} size={120} />
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-sm text-ink-2">Halaman ini sedang dikerjakan{owner ? ` oleh ${owner}` : ''}.</p>
      <div className="mt-2 flex gap-2.5">
        <Button variant="secondary" to="/dashboard">Buka Dashboard</Button>
        <Button to="/styleguide">Lihat Styleguide</Button>
      </div>
    </div>
  )
}

export function NotFound() {
  return (
    <div className="bg-hero flex min-h-[70dvh] flex-col items-center justify-center gap-3 px-5 py-16 text-center text-on-dark md:min-h-[calc(100dvh-76px)]">
      <Buddy type="violet" size={180} />
      <p className="text-6xl font-extrabold text-lime-400">404</p>
      <h1 className="text-2xl font-bold">Ups, halaman ini hilang</h1>
      <p className="max-w-xs text-sm text-on-dark-2">Mata kami sudah mencari ke mana-mana, tapi tidak ketemu.</p>
      <Button className="mt-3" to="/">Kembali ke Beranda</Button>
    </div>
  )
}
