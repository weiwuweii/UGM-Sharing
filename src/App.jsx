import { Route, Routes } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import CaraKerja from './pages/CaraKerja'
import Dashboard from './pages/Dashboard'
import Katalog from './pages/Katalog'
import DetailBarang from './pages/DetailBarang'
import { NotFound } from './pages/Placeholder'
import Styleguide from './pages/Styleguide'
import Beranda from './pages/Beranda'
import Masuk from './pages/Masuk'
import PasangBarang from './pages/PasangBarang'
import ProfilPublik from './pages/ProfilPublik'
import ProfilSaya from './pages/ProfilSaya'
import Tersimpan from './pages/Tersimpan'

// Daftar halaman. Halaman yang masih Placeholder diganti oleh pemilik modulnya
// (lihat pembagian tugas di blueprint): C = Beranda, Katalog, Detail; D = Masuk, Pasang Barang; A = Cara Kerja.
export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Beranda />} />
        <Route path="katalog" element={<Katalog />} />
        <Route path="barang/:id" element={<DetailBarang />} />
        <Route path="pasang" element={<PasangBarang />} />
        <Route path="masuk" element={<Masuk />} />
        <Route path="profil" element={<ProfilSaya />} />
        <Route path="tersimpan" element={<Tersimpan />} />
        <Route path="profil/:id" element={<ProfilPublik />} />
        <Route path="cara-kerja" element={<CaraKerja />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="styleguide" element={<Styleguide />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
