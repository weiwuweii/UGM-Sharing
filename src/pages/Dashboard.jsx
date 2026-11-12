import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Buddy from '../components/buddy/Buddy'
import { BUDDY_TINT, buddyForCategory } from '../components/buddy/buddyMap'
import BookingCard from '../components/dashboard/BookingCard'
import ReviewSheet from '../components/dashboard/ReviewSheet'
import { ItemStatus } from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Sheet from '../components/ui/Sheet'
import { EmptyState, ErrorState, Skeleton } from '../components/ui/States'
import { useToast } from '../components/ui/toast'
import { getCurrentUser, getMyProfile } from '../lib/api/auth'
import { updateBookingStatus } from '../lib/api/bookings'
import { getMyDashboard } from '../lib/api/dashboard'
import { updateItem } from '../lib/api/items'
import { rupiah, rupiahRingkas } from '../lib/format'

const TABS = [
  { id: 'masuk', label: 'Request Masuk' },
  { id: 'saya', label: 'Request Saya' },
  { id: 'barang', label: 'Barang Saya' },
  { id: 'riwayat', label: 'Riwayat' },
]

async function fetchDashboard() {
  const { data: user } = await getCurrentUser()
  if (!user) return { next: { status: 'guest' } }
  const [{ data, error }, { data: profile }] = await Promise.all([getMyDashboard(), getMyProfile()])
  const firstName = profile?.full_name?.split(' ')[0]
  if (error) return { next: { status: 'error', message: error }, firstName }
  return { next: { status: 'ready', data }, firstName }
}

const STATUS_MSG = {
  disetujui: 'Request disetujui. Kontak WhatsApp sudah terbuka.',
  ditolak: 'Request ditolak',
  selesai: 'Transaksi ditandai selesai',
  dibatalkan: 'Request dibatalkan',
}

// Dashboard (F6): ringkasan hemat dan pemasukan, request masuk, request saya, barang saya, riwayat.
export default function Dashboard() {
  const [state, setState] = useState({ status: 'loading' })
  const [name, setName] = useState('')
  const [params, setParams] = useSearchParams()
  const tab = TABS.some((t) => t.id === params.get('tab')) ? params.get('tab') : 'masuk'
  const [busyId, setBusyId] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [review, setReview] = useState(null)
  const toast = useToast()

  const apply = useCallback(({ next, firstName }) => {
    if (firstName) setName(firstName)
    setState(next)
  }, [])

  const load = useCallback(() => fetchDashboard().then(apply), [apply])

  useEffect(() => {
    let alive = true
    fetchDashboard().then((r) => alive && apply(r))
    return () => { alive = false }
  }, [apply])

  async function ubahStatus(booking, status) {
    if ((status === 'ditolak' || status === 'dibatalkan') && !confirm) {
      setConfirm({ booking, status })
      return
    }
    setConfirm(null)
    setBusyId(booking.id)
    const { error } = await updateBookingStatus(booking.id, status)
    setBusyId(null)
    if (error) { toast(error, 'error'); return }
    toast(STATUS_MSG[status])
    load()
  }

  async function ubahBarang(item) {
    const next = item.status === 'nonaktif' ? 'tersedia' : 'nonaktif'
    setBusyId(item.id)
    const { error } = await updateItem(item.id, { status: next })
    setBusyId(null)
    if (error) { toast(error, 'error'); return }
    toast(next === 'nonaktif' ? 'Barang disembunyikan dari katalog' : 'Barang tampil lagi di katalog')
    load()
  }

  const d = state.data
  const pendingCount = d?.incoming_requests?.filter((b) => b.status === 'pending').length ?? 0

  return (
    <div className="mx-auto max-w-[1200px]">
      {/* Header navy dengan ringkasan */}
      <section className="rounded-b-sheet bg-navy-700 px-5 pt-8 pb-6 text-on-dark md:mx-6 md:mt-6 md:rounded-sheet md:px-10 md:py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-on-dark-2">{name ? `Halo, ${name}` : 'Halo'}</p>
            <h1 className="text-2xl font-bold md:text-[32px]">Dashboard</h1>
          </div>
          <Buddy type="violet" size={56} className="md:size-20" />
        </div>
        {(state.status === 'loading' || state.status === 'ready') && (
          <div className="mt-5 grid grid-cols-2 gap-3 md:max-w-xl">
            <Stat tone="lime" label="Total hemat" value={d ? rupiahRingkas(d.total_saved) : null} hint="dibanding beli baru" />
            <Stat tone="white" label="Pemasukan" value={d ? rupiahRingkas(d.total_income) : null} hint="dari transaksi selesai" />
          </div>
        )}
      </section>

      <div className="px-5 pt-5 md:px-6">
        {/* Tab */}
        <div className={`-mx-5 overflow-x-auto px-5 md:mx-0 md:px-0 ${state.status === 'guest' ? 'hidden' : ''}`} role="tablist" aria-label="Bagian dashboard">
          <div className="flex w-max gap-2">
            {TABS.map((t) => {
              const on = t.id === tab
              return (
                <button
                  key={t.id}
                  role="tab"
                  type="button"
                  aria-selected={on}
                  onClick={() => setParams(t.id === 'masuk' ? {} : { tab: t.id }, { replace: true })}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition ${on ? 'bg-navy-700 text-on-dark' : 'bg-surface text-ink ring-[1.5px] ring-inset ring-line hover:bg-bg-soft'}`}
                >
                  {t.label}
                  {t.id === 'masuk' && pendingCount > 0 && (
                    <span className="inline-flex size-5 items-center justify-center rounded-full bg-buddy-coral text-xs text-white">{pendingCount}</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div className="py-5" role="tabpanel">
          {state.status === 'loading' && <LoadingList />}
          {state.status === 'guest' && (
            <EmptyState buddy="kalkulator" title="Masuk dulu, yuk" action={<Button to="/masuk">Masuk dengan email UGM</Button>}>
              Dashboard menampilkan request pinjam, barang yang kamu pasang, dan berapa yang sudah kamu hemat.
            </EmptyState>
          )}
          {state.status === 'error' && <ErrorState message={state.message} onRetry={load} />}
          {state.status === 'ready' && (
            <TabContent
              tab={tab}
              data={d}
              busyId={busyId}
              onStatus={ubahStatus}
              onReview={(booking, counterpart) => setReview({ booking, counterpart })}
              onToggleItem={ubahBarang}
            />
          )}
        </div>
      </div>

      <Sheet
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={confirm?.status === 'ditolak' ? 'Tolak request ini?' : 'Batalkan request ini?'}
        description={confirm ? `${confirm.booking.item?.title ?? ''}. Tindakan ini tidak bisa dibatalkan.` : ''}
        footer={
          <div className="flex gap-2.5">
            <Button variant="secondary" full onClick={() => setConfirm(null)}>Kembali</Button>
            <Button variant="dark" full onClick={() => ubahStatus(confirm.booking, confirm.status)}>
              {confirm?.status === 'ditolak' ? 'Ya, tolak' : 'Ya, batalkan'}
            </Button>
          </div>
        }
      />

      <ReviewSheet
        booking={review?.booking}
        counterpart={review?.counterpart}
        onClose={() => setReview(null)}
        onDone={load}
      />
    </div>
  )
}

function Stat({ tone, label, value, hint }) {
  const box = tone === 'lime' ? 'bg-lime-400 text-navy-900' : 'bg-surface text-navy-700'
  return (
    <div className={`flex min-w-0 flex-col gap-0.5 rounded-card px-4 py-3.5 ${box}`}>
      <p className="text-xs font-medium">{label}</p>
      {value === null ? (
        <span className="my-1 h-7 w-24 animate-pulse rounded bg-current opacity-15" />
      ) : (
        <p className="tabular truncate text-2xl font-bold md:text-[28px]">{value}</p>
      )}
      <p className="text-xs opacity-80">{hint}</p>
    </div>
  )
}

function LoadingList() {
  return (
    <div className="grid gap-3 md:grid-cols-2" aria-busy="true" aria-label="Memuat">
      {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-40 rounded-card" />)}
    </div>
  )
}

function TabContent({ tab, data, busyId, onStatus, onReview, onToggleItem }) {
  if (tab === 'barang') return <MyItems items={data.my_items ?? []} busyId={busyId} onToggle={onToggleItem} />

  const config = {
    masuk: {
      list: data.incoming_requests ?? [],
      empty: ['charger', 'Belum ada request masuk', 'Request pinjam atau beli untuk barangmu akan muncul di sini.', <Button key="b" to="/pasang">Pasang barang</Button>],
    },
    saya: {
      list: data.my_requests ?? [],
      empty: ['kamera', 'Kamu belum mengirim request', 'Cari barang yang kamu butuhkan, lalu ajukan pinjam.', <Button key="b" to="/katalog">Buka katalog</Button>],
    },
    riwayat: {
      list: data.history ?? [],
      empty: ['violet', 'Riwayat masih kosong', 'Transaksi yang selesai, ditolak, atau dibatalkan akan tersimpan di sini.', null],
    },
  }[tab]

  if (config.list.length === 0) {
    const [buddy, title, text, action] = config.empty
    return <EmptyState buddy={buddy} title={title} action={action}>{text}</EmptyState>
  }

  return (
    <div className="grid items-start gap-3 md:grid-cols-2">
      {config.list.map((b) => (
        <BookingCard
          key={b.id}
          booking={b}
          role={tab === 'masuk' ? 'owner' : tab === 'saya' ? 'borrower' : b.role === 'pemilik' ? 'owner' : 'borrower'}
          busy={busyId === b.id}
          onStatus={onStatus}
          onReview={onReview}
        />
      ))}
    </div>
  )
}

function MyItems({ items, busyId, onToggle }) {
  if (items.length === 0) {
    return (
      <EmptyState buddy="kalkulator" title="Belum ada barang" action={<Button to="/pasang">Pasang barang pertama</Button>}>
        Barang yang jarang kamu pakai bisa jadi pemasukan tambahan dan membantu teman yang butuh.
      </EmptyState>
    )
  }
  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {items.map((item) => {
        const buddy = buddyForCategory(item.category)
        const bisaPinjam = item.listing_type !== 'jual'
        const canToggle = item.status === 'tersedia' || item.status === 'nonaktif'
        return (
          <li key={item.id} className="flex items-center gap-3 rounded-card bg-surface p-3 shadow-card">
            <div className={`flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-field ${BUDDY_TINT[buddy]} ${item.status === 'nonaktif' ? 'opacity-50' : ''}`}>
              {item.photos?.[0] ? <img src={item.photos[0]} alt="" className="size-full object-cover" /> : <Buddy type={buddy} size={46} />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{item.title}</p>
              <p className="tabular text-sm font-bold text-navy-700">
                {rupiah(bisaPinjam ? item.rent_price_per_day : item.sale_price)}
                <span className="ml-1 text-xs font-normal text-ink-2">{bisaPinjam ? '/hari' : 'beli'}</span>
              </p>
              <ItemStatus status={item.status} />
            </div>
            {canToggle && (
              <Button size="sm" variant="secondary" loading={busyId === item.id} onClick={() => onToggle(item)}>
                {item.status === 'nonaktif' ? 'Tampilkan' : 'Sembunyikan'}
              </Button>
            )}
          </li>
        )
      })}
    </ul>
  )
}
