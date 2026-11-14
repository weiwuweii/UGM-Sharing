import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import Buddy from '../buddy/Buddy'
import Button from '../ui/Button'
import Icon from '../ui/Icon'
import { useToast } from '../ui/toast'
import { signOut } from '../../lib/api'
import { useSession } from '../../lib/useSession'

const LINKS = [
  { to: '/', label: 'Beranda', icon: 'home', end: true },
  { to: '/katalog', label: 'Katalog', icon: 'grid' },
  { to: '/dashboard', label: 'Dashboard', icon: 'chart' },
  { to: '/profil', label: 'Profil', icon: 'user' },
]

// Kerangka semua halaman: navbar putih di desktop, bottom nav navy di HP.
export default function AppShell() {
  return (
    <div className="min-h-dvh">
      <a href="#konten" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[70] focus:rounded-full focus:bg-lime-400 focus:px-4 focus:py-2 focus:font-semibold focus:text-navy-900">
        Langsung ke konten
      </a>
      <DesktopNav />
      <main id="konten">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
    </div>
  )
}

function DesktopNav() {
  return (
    <header className="sticky top-0 z-40 hidden bg-surface/95 shadow-card backdrop-blur md:block">
      <nav className="mx-auto flex h-[76px] max-w-[1200px] items-center justify-between px-6" aria-label="Utama">
        <Link to="/" className="flex items-center gap-2.5">
          <Buddy type="violet" size={40} />
          <span className="text-xl font-bold text-navy-700">UGM Sharing</span>
        </Link>
        <ul className="flex items-center gap-9">
          {[LINKS[0], LINKS[1], { to: '/cara-kerja', label: 'Cara Kerja' }, LINKS[2]].map((l) => (
            <li key={l.to}>
              <NavLink to={l.to} end={l.end} className="group flex flex-col items-center gap-1.5 text-sm">
                {({ isActive }) => (
                  <>
                    <span className={isActive ? 'font-semibold text-navy-700' : 'font-medium text-ink-2 group-hover:text-ink'}>{l.label}</span>
                    <span className={`h-1 w-6 rounded-full ${isActive ? 'bg-lime-400' : 'bg-transparent'}`} aria-hidden="true" />
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-5">
          <AkunMenu />
          <Button to="/pasang">Pasang Barang</Button>
        </div>
      </nav>
    </header>
  )
}

// Di navbar desktop: tombol Masuk kalau belum login, atau Profil + Keluar kalau sudah.
function AkunMenu() {
  const { user, loading } = useSession()
  const navigate = useNavigate()
  const toast = useToast()
  const lokasi = useLocation()
  // Setelah masuk, kembali ke halaman yang sedang dibuka
  const next = lokasi.pathname === '/masuk' || lokasi.pathname === '/' ? '' : `?next=${encodeURIComponent(lokasi.pathname + lokasi.search)}`
  if (loading) return <span className="w-16" aria-hidden="true" />
  if (!user) return <Link to={`/masuk${next}`} className="text-sm font-semibold text-navy-700 hover:underline">Masuk</Link>

  async function keluar() {
    await signOut()
    toast('Kamu sudah keluar')
    navigate('/')
  }
  return (
    <div className="flex items-center gap-4">
      <Link to="/profil" className="flex items-center gap-2 text-sm font-semibold text-navy-700 hover:underline">
        <span className="inline-flex size-8 items-center justify-center rounded-full bg-tint-blue"><Icon name="user" size={16} /></span>
        Profil
      </Link>
      <button type="button" onClick={keluar} className="text-sm font-medium text-ink-2 hover:text-ink">Keluar</button>
    </div>
  )
}

function BottomNav() {
  const item = (l) => (
    <NavLink key={l.to} to={l.to} end={l.end} className="flex min-w-14 flex-col items-center gap-0.5 text-xs font-medium">
      {({ isActive }) => (
        <span className={`flex flex-col items-center gap-0.5 ${isActive ? 'text-lime-400' : 'text-on-dark-2'}`}>
          <Icon name={l.icon} size={22} />
          {l.label}
        </span>
      )}
    </NavLink>
  )
  return (
    <nav
      aria-label="Navigasi bawah"
      className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[calc(16px+env(safe-area-inset-bottom,0px))] md:hidden"
    >
      <div className="mx-auto flex h-[68px] max-w-[420px] items-center justify-between rounded-full bg-navy-900 px-4 shadow-float">
        {item(LINKS[0])}
        {item(LINKS[1])}
        <Link to="/pasang" aria-label="Pasang barang" className="inline-flex size-[52px] items-center justify-center rounded-full bg-lime-400 text-navy-900 transition active:scale-95">
          <Icon name="plus" size={24} />
        </Link>
        {item(LINKS[2])}
        {item(LINKS[3])}
      </div>
    </nav>
  )
}

const KOLOM_FOOTER = [
  { judul: 'Jelajah', link: [['Katalog', '/katalog'], ['Cara Kerja', '/cara-kerja']] },
  { judul: 'Akun', link: [['Masuk', '/masuk'], ['Dashboard', '/dashboard']] },
  { judul: 'Bantuan', link: [['Barang dilarang', '/cara-kerja#aturan'], ['Lapor barang', '/cara-kerja#aturan']] },
]

// Footer sesuai desain Figma (Beranda Desktop)
function Footer() {
  return (
    <footer className="bg-navy-900 text-on-dark">
      <div className="mx-auto grid max-w-[1200px] gap-8 px-5 pt-10 pb-32 md:grid-cols-[1fr_auto] md:gap-12 md:px-6 md:pt-11 md:pb-10">
        <div>
          <Link to="/" className="inline-flex items-center gap-3">
            <Buddy type="violet" size={44} />
            <span className="text-2xl font-bold">UGM Sharing</span>
          </Link>
          <p className="mt-3 text-sm text-on-dark-2">Pinjam dulu, beli kalau perlu.</p>
        </div>
        <nav aria-label="Tautan footer" className="grid grid-cols-3 gap-6 md:gap-24">
          {KOLOM_FOOTER.map((k) => (
            <div key={k.judul}>
              <p className="font-semibold">{k.judul}</p>
              <ul className="mt-2 flex flex-col gap-1.5 text-sm text-on-dark-2">
                {k.link.map(([label, to]) => (
                  <li key={label}><Link to={to} className="hover:text-on-dark hover:underline">{label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <p className="text-xs text-on-dark-2 md:col-span-2">
          Karya COMMIT 2026 Web Design. Bukan layanan resmi Universitas Gadjah Mada.
        </p>
      </div>
    </footer>
  )
}
