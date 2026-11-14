import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Buddy from '../components/buddy/Buddy'
import { BUDDY_TYPES } from '../components/buddy/buddyMap'
import ItemCard, { ItemCardSkeleton } from '../components/items/ItemCard'
import Button from '../components/ui/Button'
import Icon from '../components/ui/Icon'
import { EmptyState, ErrorState, Skeleton } from '../components/ui/States'
import { getProfile } from '../lib/api'
import { tanggalPendek } from '../lib/format'
import { useSession } from '../lib/useSession'
import { useWishlist } from '../lib/useWishlist'

// Maskot tetap untuk setiap orang (dipilih dari id, jadi tidak berubah-ubah)
function buddyUntuk(id = '') {
  let h = 0
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return BUDDY_TYPES[h % BUDDY_TYPES.length]
}

// Profil Publik: info pemilik, barang yang dipasang, dan ulasan dari pengguna lain.
export default function ProfilPublik() {
  const { id } = useParams()
  const { user } = useSession()
  const { ids, toggle } = useWishlist()
  const [state, setState] = useState({ id: null, data: null, error: null })
  const [muatUlang, setMuatUlang] = useState(0)

  useEffect(() => {
    let batal = false
    getProfile(id).then(({ data, error }) => {
      if (!batal) setState({ id, data, error })
    })
    return () => { batal = true }
  }, [id, muatUlang])

  const memuat = state.id !== id
  const data = memuat ? null : state.data
  const error = memuat ? null : state.error

  if (error) {
    return (
      <div className="mx-auto max-w-xl px-5 py-16">
        {/tidak ditemukan/i.test(error) ? (
          <EmptyState buddy="violet" title="Pengguna tidak ditemukan" action={<Button to="/katalog">Kembali ke Katalog</Button>}>
            Tautan profil ini mungkin salah atau akunnya sudah dihapus.
          </EmptyState>
        ) : (
          <ErrorState message={error} onRetry={() => setMuatUlang((n) => n + 1)} />
        )}
      </div>
    )
  }

  const profil = data?.profile
  const items = data?.items ?? []
  const ulasan = data?.reviews ?? []
  const milikSendiri = user && profil && user.id === profil.id
  const tersedia = items.filter((i) => i.status === 'tersedia').length

  return (
    <div>
      <section className="bg-hero text-on-dark">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-5 px-5 py-10 text-center md:flex-row md:gap-8 md:px-6 md:py-12 md:text-left">
          {profil ? <Buddy type={buddyUntuk(profil.id)} size={112} /> : <Skeleton className="size-28 rounded-full" />}
          <div className="min-w-0 flex-1">
            {profil ? (
              <>
                <h1 className="text-3xl font-extrabold break-words md:text-4xl">{profil.full_name || 'Mahasiswa UGM'}</h1>
                <p className="mt-1 text-on-dark-2">{profil.faculty ? `Fakultas ${profil.faculty}` : 'Mahasiswa UGM'}</p>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 md:items-start">
                <Skeleton className="h-9 w-64" />
                <Skeleton className="h-5 w-40" />
              </div>
            )}
          </div>
          {milikSendiri && <Button variant="secondary" to="/profil">Ubah Profil</Button>}
        </div>
      </section>

      <div className="mx-auto flex max-w-[1200px] flex-col gap-10 px-5 py-8 md:px-6 md:py-12">
        <dl className="grid grid-cols-3 gap-3 md:max-w-2xl md:gap-5">
          <Statistik label="Rating" nilai={profil ? (profil.review_count ? Number(profil.rating_avg).toFixed(1).replace('.', ',') : '–') : null} ikon />
          <Statistik label="Ulasan" nilai={profil ? profil.review_count : null} />
          <Statistik label="Barang tersedia" nilai={profil ? tersedia : null} />
        </dl>

        <section aria-labelledby="judul-barang">
          <h2 id="judul-barang" className="mb-4 text-xl font-bold md:text-2xl">
            Barang {milikSendiri ? 'saya' : 'yang dipasang'}
          </h2>
          {memuat ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
              {Array.from({ length: 4 }, (_, i) => <ItemCardSkeleton key={i} />)}
            </div>
          ) : items.length === 0 ? (
            <EmptyState buddy="kamera" title="Belum ada barang" action={milikSendiri ? <Button to="/pasang">Pasang Barang</Button> : null}>
              {milikSendiri ? 'Barang yang kamu pasang akan muncul di sini.' : 'Pengguna ini belum memasang barang.'}
            </EmptyState>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
              {items.map((item) => (
                <ItemCard key={item.id} item={item} saved={ids.has(item.id)} onToggleSaved={toggle} />
              ))}
            </div>
          )}
        </section>

        <section aria-labelledby="judul-ulasan" className="md:max-w-3xl">
          <h2 id="judul-ulasan" className="mb-4 text-xl font-bold md:text-2xl">Ulasan</h2>
          {memuat ? (
            <div className="flex flex-col gap-3"><Skeleton className="h-24" /><Skeleton className="h-24" /></div>
          ) : ulasan.length === 0 ? (
            <p className="rounded-card bg-surface p-5 text-sm text-ink-2 shadow-card">
              Belum ada ulasan. Ulasan muncul setelah transaksi selesai.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {ulasan.map((r) => (
                <li key={r.id} className="rounded-card bg-surface p-5 shadow-card">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Link to={`/profil/${r.reviewer?.id}`} className="font-semibold hover:underline">
                      {r.reviewer?.full_name || 'Mahasiswa UGM'}
                    </Link>
                    <span className="text-xs text-ink-2">{r.created_at ? tanggalPendek(r.created_at) : ''}</span>
                  </div>
                  <p className="mt-1 flex gap-0.5 text-buddy-yellow" aria-label={`${r.rating} dari 5 bintang`}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <Icon key={i} name="star" size={16} filled={i < r.rating} className={i < r.rating ? '' : 'text-line'} />
                    ))}
                  </p>
                  {r.comment && <p className="mt-2 text-sm text-ink-2">{r.comment}</p>}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}

function Statistik({ label, nilai, ikon = false }) {
  return (
    <div className="rounded-card bg-surface p-4 shadow-card">
      <dt className="text-xs text-ink-2">{label}</dt>
      <dd className="mt-1 flex items-center gap-1 text-2xl font-bold">
        {nilai === null ? <Skeleton className="h-7 w-12" /> : nilai}
        {ikon && nilai !== null && nilai !== '–' && <Icon name="star" size={18} filled className="text-buddy-yellow" />}
      </dd>
    </div>
  )
}
