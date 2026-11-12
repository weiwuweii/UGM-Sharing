import { useEffect, useState } from 'react'
import { getItems } from '../lib/api/items'
import { signUp, signIn, signOut, getCurrentUser } from '../lib/api/auth'
import TesPosting from './TesPosting'
import TesBooking from './TesBooking'

export default function BackendTest() {
  const [items, setItems] = useState([])
  const [user, setUser] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nama, setNama] = useState('')
  const [pesan, setPesan] = useState('')

  useEffect(() => {
    getItems().then(({ data }) => setItems(data))
    getCurrentUser().then(({ data }) => setUser(data))
  }, [])

  async function daftar() {
    const { data, error } = await signUp(email, password, nama)
    setPesan(error ?? 'Daftar berhasil, silakan masuk')
    if (data) setUser(null)
  }

  async function masuk() {
    const { data, error } = await signIn(email, password)
    setPesan(error ?? 'Berhasil masuk')
    if (data) setUser(data)
  }

  async function keluar() {
    await signOut()
    setUser(null)
    setPesan('Sudah keluar')
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold text-blue-900">Tes Login dan Katalog</h1>

      <div className="rounded-lg border p-4 space-y-2 max-w-md">
        <p>Status: <b>{user ? 'Masuk sebagai ' + user.email : 'Belum login'}</b></p>
        <input className="w-full rounded border p-2" placeholder="Nama (untuk daftar)" value={nama} onChange={(e) => setNama(e.target.value)} />
        <input className="w-full rounded border p-2" placeholder="Email UGM" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full rounded border p-2" type="password" placeholder="Password (min. 6 karakter)" value={password} onChange={(e) => setPassword(e.target.value)} />
        <div className="flex gap-2">
          <button className="rounded bg-blue-900 px-3 py-2 text-white" onClick={daftar}>Daftar</button>
          <button className="rounded bg-blue-700 px-3 py-2 text-white" onClick={masuk}>Masuk</button>
          <button className="rounded bg-gray-500 px-3 py-2 text-white" onClick={keluar}>Keluar</button>
        </div>
        {pesan && <p className="text-sm">{pesan}</p>}
      </div>

      <TesPosting />
      <TesBooking />

      <ul className="space-y-2">
        {items.map((i) => (
          <li key={i.id} className="rounded-lg border p-3">
            <b>{i.title}</b> | {i.location} | Rp {i.rent_price_per_day}/hari | pemilik: {i.owner?.full_name}
          </li>
        ))}
      </ul>
    </div>
  )
}

