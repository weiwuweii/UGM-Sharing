import { Route, Routes } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import Dashboard from './pages/Dashboard'
import Placeholder, { NotFound } from './pages/Placeholder'
import Styleguide from './pages/Styleguide'
import BackendTest from './dev/BackendTest'

// Daftar halaman. Halaman yang masih Placeholder diganti oleh pemilik modulnya
// (lihat pembagian tugas di blueprint): C = Beranda, Katalog, Detail; D = Masuk, Pasang Barang; A = Cara Kerja.
export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Placeholder title="Beranda" owner="C" buddy="kamera" />} />
        <Route path="katalog" element={<Placeholder title="Katalog" owner="C" buddy="kalkulator" />} />
        <Route path="barang/:id" element={<Placeholder title="Detail Barang" owner="C" buddy="kalkulator" />} />
        <Route path="pasang" element={<Placeholder title="Pasang Barang" owner="D" buddy="charger" />} />
        <Route path="masuk" element={<Placeholder title="Masuk / Daftar" owner="D" />} />
        <Route path="profil" element={<Placeholder title="Profil" />} />
        <Route path="profil/:id" element={<Placeholder title="Profil Publik" />} />
        <Route path="cara-kerja" element={<Placeholder title="Cara Kerja" owner="A" buddy="jaslab" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="styleguide" element={<Styleguide />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      {/* Halaman tes backend lama, di luar layout */}
      <Route path="tes-backend" element={<BackendTest />} />
    </Routes>
  )
}
