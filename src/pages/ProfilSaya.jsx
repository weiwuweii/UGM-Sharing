import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import Buddy from '../components/buddy/Buddy'
import Button from '../components/ui/Button'
import Field from '../components/ui/Field'
import { Skeleton } from '../components/ui/States'
import { useToast } from '../components/ui/toast'
import { FAKULTAS } from '../content/pilihan'
import { getMyProfile, signOut, updateMyProfile } from '../lib/api'
import { useSession } from '../lib/useSession'

// Profil Saya: nama, fakultas, dan nomor WhatsApp.
// Nomor WhatsApp hanya dibuka ke pihak lain setelah request disetujui.
export default function ProfilSaya() {
  const { user, loading } = useSession()
  const navigate = useNavigate()
  const toast = useToast()
  const [form, setForm] = useState(null)
  const [errors, setErrors] = useState({})
  const [menyimpan, setMenyimpan] = useState(false)

  useEffect(() => {
    if (!user) return
    let batal = false
    getMyProfile().then(({ data }) => {
      if (!batal) setForm({ full_name: data?.full_name ?? '', faculty: data?.faculty ?? '', whatsapp: data?.whatsapp ?? '' })
    })
    return () => { batal = true }
  }, [user])

  if (!loading && !user) return <Navigate to="/masuk?next=/profil" replace />

  const ubah = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    setErrors((er) => ({ ...er, [k]: null }))
  }

  async function simpan(e) {
    e.preventDefault()
    const er = {}
    if (form.full_name.trim().length < 2) er.full_name = 'Nama wajib diisi'
    const digit = form.whatsapp.replace(/\D/g, '')
    if (digit && (digit.length < 10 || digit.length > 15)) er.whatsapp = 'Nomor tidak valid. Contoh: 081234567890'
    setErrors(er)
    if (Object.keys(er).length) return
    setMenyimpan(true)
    const res = await updateMyProfile({ full_name: form.full_name.trim(), faculty: form.faculty || null, whatsapp: digit || null })
    setMenyimpan(false)
    toast(res.error ? res.error : 'Profil disimpan', res.error ? 'error' : undefined)
  }

  async function keluar() {
    await signOut()
    toast('Kamu sudah keluar')
    navigate('/')
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6 px-5 py-8 md:py-12">
      <div className="flex items-center gap-4">
        <Buddy type="violet" size={80} />
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">Profil Saya</h1>
          <p className="truncate text-sm text-ink-2">{user?.email}</p>
        </div>
      </div>

      {!form ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-12" /><Skeleton className="h-12" /><Skeleton className="h-12" />
        </div>
      ) : (
        <form onSubmit={simpan} noValidate className="flex flex-col gap-4 rounded-card bg-surface p-5 shadow-card md:p-6">
          <Field label="Nama lengkap" value={form.full_name} onChange={ubah('full_name')} error={errors.full_name} autoComplete="name" />
          <Field as="select" label="Fakultas" value={form.faculty} onChange={ubah('faculty')}>
            <option value="">Pilih fakultas</option>
            {FAKULTAS.map((f) => <option key={f} value={f}>{f}</option>)}
          </Field>
          <Field
            label="Nomor WhatsApp"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={form.whatsapp}
            onChange={ubah('whatsapp')}
            error={errors.whatsapp}
            placeholder="081234567890"
            hint="Wajib diisi supaya peminjam atau pemilik bisa menghubungimu. Hanya terlihat setelah request disetujui."
          />
          <Button type="submit" full loading={menyimpan}>Simpan Profil</Button>
        </form>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <Button variant="secondary" to="/dashboard">Buka Dashboard</Button>
        <Button variant="secondary" to="/tersimpan">Barang Tersimpan</Button>
      </div>
      <Button variant="danger" onClick={keluar}>Keluar</Button>
    </div>
  )
}
