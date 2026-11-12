import { useEffect, useState } from 'react'
import { getItems } from '../lib/api/items'
import { createBooking } from '../lib/api/bookings'

export default function TesBooking() {
  const [items, setItems] = useState([])
  const [itemId, setItemId] = useState('')
  const [type, setType] = useState('pinjam')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [note, setNote] = useState('')
  const [pesan, setPesan] = useState('')

  useEffect(() => {
    getItems().then(({ data }) => {
      setItems(data)
      if (data.length > 0) setItemId(data[0].id)
    })
  }, [])

  async function kirim() {
    setPesan('Mengirim...')
    const { data, error } = await createBooking(itemId, type, start, end, note)
    setPesan(error ?? 'Berhasil! Status: ' + data.status + ', hemat: Rp ' + data.saved_amount)
  }

  const input = 'w-full rounded border p-2'
  return (
    <div className="rounded-lg border p-4 space-y-2 max-w-md">
      <h2 className="font-bold text-blue-900">Tes Booking (harus login dulu)</h2>
      <select className={input} value={itemId} onChange={(e) => setItemId(e.target.value)}>
        {items.map((i) => (
          <option key={i.id} value={i.id}>{i.title} (pemilik: {i.owner?.full_name})</option>
        ))}
      </select>
      <select className={input} value={type} onChange={(e) => setType(e.target.value)}>
        <option value="pinjam">pinjam</option>
        <option value="beli">beli</option>
      </select>
      <label className="block text-sm">Tanggal mulai</label>
      <input className={input} type="date" value={start} onChange={(e) => setStart(e.target.value)} />
      <label className="block text-sm">Tanggal selesai</label>
      <input className={input} type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
      <input className={input} placeholder="Catatan (opsional)" value={note} onChange={(e) => setNote(e.target.value)} />
      <button className="rounded bg-blue-900 px-3 py-2 text-white" onClick={kirim}>Kirim request</button>
      {pesan && <p className="text-sm">{pesan}</p>}
    </div>
  )
}