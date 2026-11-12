import { useState } from 'react'
import { Link } from 'react-router-dom'
import Buddy from '../buddy/Buddy'
import { BUDDY_TINT, buddyForCategory } from '../buddy/buddyMap'
import Badge, { BookingStatus } from '../ui/Badge'
import Button from '../ui/Button'
import Icon from '../ui/Icon'
import { rupiah, rentangTanggal } from '../../lib/format'
import { getContact } from '../../lib/api/bookings'

// Kartu satu request/transaksi di Dashboard.
// role "owner": request masuk ke barangku. role "borrower": request yang kukirim.
// Aksi yang muncul mengikuti status booking dan peran:
//   owner + pending   -> Tolak / Setujui
//   owner + disetujui -> Hubungi / Tandai selesai
//   borrower + pending   -> Batalkan
//   borrower + disetujui -> Hubungi
//   selesai -> Beri ulasan
export default function BookingCard({ booking, role, onStatus, onReview, busy }) {
  const [contact, setContact] = useState(null)
  const [contactErr, setContactErr] = useState('')
  const [loadingContact, setLoadingContact] = useState(false)

  const other = role === 'owner' ? booking.borrower : booking.owner
  const otherName = other?.full_name ?? 'Pengguna'
  const isPinjam = booking.type === 'pinjam'
  const headline =
    role === 'owner'
      ? `${otherName} ingin ${isPinjam ? 'meminjam' : 'membeli'}`
      : `${isPinjam ? 'Pinjam' : 'Beli'} dari ${otherName}`
  const buddy = buddyForCategory(booking.item?.title)

  async function lihatKontak() {
    setLoadingContact(true)
    setContactErr('')
    const { data, error } = await getContact(booking.id)
    setLoadingContact(false)
    if (error) setContactErr(error)
    else setContact(data)
  }

  return (
    <article className="flex flex-col gap-3 rounded-card bg-surface p-4 shadow-card">
      <div className="flex items-center gap-3">
        <div className={`flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-field ${BUDDY_TINT[buddy]}`}>
          {booking.item?.photo ? (
            <img src={booking.item.photo} alt="" className="size-full object-cover" />
          ) : (
            <Buddy type={buddy} size={36} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{headline}</p>
          <Link to={`/barang/${booking.item?.id}`} className="block truncate text-xs text-ink-2 hover:text-navy-500 hover:underline">
            {booking.item?.title}
          </Link>
        </div>
        <BookingStatus status={booking.status} />
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-2">
        <span className="inline-flex items-center gap-1.5">
          <Icon name="calendar" size={16} />
          {isPinjam ? rentangTanggal(booking.start_date, booking.end_date) : 'Pembelian'}
        </span>
        {isPinjam && booking.saved_amount > 0 && (
          <Badge tone="lime">Hemat {rupiah(booking.saved_amount)}</Badge>
        )}
      </div>

      {booking.note && (
        <p className="rounded-field bg-bg px-3 py-2 text-sm text-ink-2">“{booking.note}”</p>
      )}

      {contact && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-field bg-lime-200 px-3 py-2.5">
          <div className="min-w-0">
            <p className="text-xs text-navy-700">WhatsApp {contact.full_name ?? otherName}</p>
            <p className="tabular text-sm font-bold text-navy-900 select-all">+{contact.whatsapp}</p>
          </div>
          <Button size="sm" variant="dark" href={contact.link}>Buka WhatsApp</Button>
        </div>
      )}
      {contactErr && <p role="alert" className="text-xs text-danger">{contactErr}</p>}

      <Actions
        booking={booking}
        role={role}
        busy={busy}
        onStatus={onStatus}
        onReview={() => onReview(booking, otherName)}
        onContact={lihatKontak}
        loadingContact={loadingContact}
        hasContact={!!contact}
      />
    </article>
  )
}

function Actions({ booking, role, busy, onStatus, onReview, onContact, loadingContact, hasContact }) {
  const s = booking.status
  const contactBtn = !hasContact && (
    <Button variant="dark" full loading={loadingContact} onClick={onContact} icon={<Icon name="chat" size={18} />}>
      Lihat kontak WhatsApp
    </Button>
  )

  if (role === 'owner' && s === 'pending') {
    return (
      <div className="flex gap-2.5">
        <Button variant="secondary" full disabled={busy} onClick={() => onStatus(booking, 'ditolak')}>Tolak</Button>
        <Button full loading={busy} onClick={() => onStatus(booking, 'disetujui')}>Setujui</Button>
      </div>
    )
  }
  if (role === 'owner' && s === 'disetujui') {
    return (
      <div className="flex flex-col gap-2.5 sm:flex-row">
        {contactBtn}
        <Button variant="secondary" full loading={busy} onClick={() => onStatus(booking, 'selesai')}>Tandai selesai</Button>
      </div>
    )
  }
  if (role === 'borrower' && s === 'pending') {
    return <Button variant="danger" full disabled={busy} onClick={() => onStatus(booking, 'dibatalkan')}>Batalkan request</Button>
  }
  if (role === 'borrower' && s === 'disetujui') return contactBtn || null
  if (s === 'selesai') {
    return <Button variant="secondary" full onClick={onReview} icon={<Icon name="star" size={18} />}>Beri ulasan</Button>
  }
  return null
}
