import { useState } from 'react'
import { createItem } from '../lib/api/items'

export default function TesPosting() {
  const [f, setF] = useState({
    title: '', category: 'Elektronik', listing_type: 'pinjam',
    retail_price: '', rent_price_per_day: '', sale_price: '', deposit: '',
    condition: 'baik', location: 'Bulaksumur', description: '',
  })
  const [files, setFiles] = useState([])
  const [pesan, setPesan] = useState('')

  const ubah = (k) => (e) => setF({ ...f, [k]: e.target.value })

  async function kirim() {
    setPesan('Mengirim...')
    const { data, error } = await createItem(f, files)
    setPesan(error ?? 'Berhasil! Barang dibuat dengan ' + data.photos.length + ' foto. Refresh untuk melihat di daftar.')
  }

  const input = 'w-full rounded border p-2'
  return (
    <div className="rounded-lg border p-4 space-y-2 max-w-md">
      <h2 className="font-bold text-blue-900">Tes Pasang Barang (harus login dulu)</h2>
      <input className={input} placeholder="Nama barang" value={f.title} onChange={ubah('title')} />
      <input className={input} placeholder="Kategori" value={f.category} onChange={ubah('category')} />
      <select className={input} value={f.listing_type} onChange={ubah('listing_type')}>
        <option value="pinjam">pinjam</option>
        <option value="jual">jual</option>
        <option value="keduanya">keduanya</option>
      </select>
      <input className={input} placeholder="Harga beli baru (retail)" value={f.retail_price} onChange={ubah('retail_price')} />
      <input className={input} placeholder="Harga sewa per hari" value={f.rent_price_per_day} onChange={ubah('rent_price_per_day')} />
      <input className={input} placeholder="Harga jual" value={f.sale_price} onChange={ubah('sale_price')} />
      <input className={input} placeholder="Deposit" value={f.deposit} onChange={ubah('deposit')} />
      <input className={input} placeholder="Lokasi" value={f.location} onChange={ubah('location')} />
      <input type="file" accept="image/*" multiple onChange={(e) => setFiles(Array.from(e.target.files))} />
      <button className="rounded bg-blue-900 px-3 py-2 text-white" onClick={kirim}>Pasang barang</button>
      {pesan && <p className="text-sm">{pesan}</p>}
    </div>
  )
}