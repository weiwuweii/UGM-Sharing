import { useState } from 'react'
import Button from '../ui/Button'
import Field from '../ui/Field'
import Sheet from '../ui/Sheet'
import { useToast } from '../ui/toast'
import { reportItem } from '../../lib/api'

export default function LaporSheet({ open, onClose, itemId }) {
  const toast = useToast()
  const [alasan, setAlasan] = useState('')
  const [kirim, setKirim] = useState(false)
  const [error, setError] = useState(null)

  async function kirimLaporan() {
    setKirim(true)
    setError(null)
    const res = await reportItem(itemId, alasan)
    setKirim(false)
    if (res.error) {
      setError(res.error)
      return
    }
    toast('Laporan terkirim. Terima kasih.')
    onClose()
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Laporkan barang"
      description="Ceritakan kenapa barang ini perlu ditinjau."
      footer={<Button full loading={kirim} onClick={kirimLaporan}>Kirim laporan</Button>}
    >
      <Field
        as="textarea"
        label="Alasan"
        placeholder="Misalnya: barang terlarang atau foto tidak sesuai"
        value={alasan}
        onChange={(e) => setAlasan(e.target.value)}
        error={error}
      />
    </Sheet>
  )
}