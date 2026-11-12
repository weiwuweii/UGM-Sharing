import { useState } from 'react'
import Sheet from '../ui/Sheet'
import Button from '../ui/Button'
import Field from '../ui/Field'
import Icon from '../ui/Icon'
import { useToast } from '../ui/toast'
import { createReview } from '../../lib/api/social'

const LABELS = ['', 'Buruk', 'Kurang', 'Cukup', 'Baik', 'Sangat baik']
const TAGS = ['Barang sesuai deskripsi', 'Tepat waktu', 'Ramah', 'Serah-terima rapi']

// Sheet ulasan setelah transaksi selesai (F10). Memanggil createReview(bookingId, rating, comment).
// Tag yang dipilih digabung ke depan komentar, karena tabel reviews hanya punya kolom comment.
export default function ReviewSheet({ booking, counterpart, onClose, onDone }) {
  const [rating, setRating] = useState(0)
  const [tags, setTags] = useState([])
  const [comment, setComment] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const toast = useToast()

  function toggleTag(t) {
    setTags((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]))
  }

  async function kirim() {
    if (!rating) { setError('Pilih jumlah bintang dulu'); return }
    setSending(true)
    setError('')
    const teks = [tags.join(', '), comment.trim()].filter(Boolean).join('. ')
    const { error: err } = await createReview(booking.id, rating, teks)
    setSending(false)
    if (err) {
      setError(err.includes('duplicate') || err.includes('unique') ? 'Kamu sudah memberi ulasan untuk transaksi ini' : err)
      return
    }
    toast('Ulasan terkirim. Terima kasih!')
    onDone?.()
    onClose()
  }

  return (
    <Sheet
      open={!!booking}
      onClose={onClose}
      title="Beri ulasan"
      description={booking ? `${booking.type === 'beli' ? 'Kamu membeli' : 'Transaksi'} ${booking.item?.title ?? ''}${counterpart ? ` dengan ${counterpart}` : ''}` : ''}
      footer={
        <div className="flex flex-col gap-2">
          {error && <p role="alert" className="text-sm text-danger">{error}</p>}
          <Button full loading={sending} onClick={kirim}>Kirim ulasan</Button>
          <p className="text-center text-xs text-ink-2">Ulasan tampil di profil dan membantu mahasiswa lain.</p>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <fieldset className="flex flex-col items-center gap-2">
          <legend className="sr-only">Rating</legend>
          <div className="flex gap-2" role="radiogroup" aria-label="Rating 1 sampai 5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={rating === n}
                aria-label={`${n} bintang`}
                onClick={() => setRating(n)}
                className="rounded-full p-1 transition active:scale-90"
              >
                <Icon name="star" size={38} strokeWidth={1.5} filled={n <= rating} className={n <= rating ? 'text-buddy-yellow' : 'text-line'} />
              </button>
            ))}
          </div>
          <p className="h-5 text-sm font-semibold text-navy-700" aria-live="polite">{LABELS[rating]}</p>
        </fieldset>

        <div className="flex flex-wrap gap-2">
          {TAGS.map((t) => {
            const on = tags.includes(t)
            return (
              <button
                key={t}
                type="button"
                aria-pressed={on}
                onClick={() => toggleTag(t)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${on ? 'bg-lime-400 text-navy-900' : 'bg-surface text-navy-900 ring-[1.5px] ring-inset ring-line hover:bg-bg-soft'}`}
              >
                {t}
              </button>
            )
          })}
        </div>

        <Field
          as="textarea"
          id="review-comment"
          label="Ceritakan pengalamanmu (opsional)"
          placeholder="Contoh: kalkulatornya bersih dan baterainya awet."
          maxLength={500}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>
    </Sheet>
  )
}
