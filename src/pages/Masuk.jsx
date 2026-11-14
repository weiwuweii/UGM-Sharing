import { useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import Buddy from '../components/buddy/Buddy'
import Button from '../components/ui/Button'
import Field, { Segmented } from '../components/ui/Field'
import { useToast } from '../components/ui/toast'
import { signIn, signUp } from '../lib/api'
import { useSession } from '../lib/useSession'

const UGM_EMAIL = /@(mail\.)?ugm\.ac\.id$/i

// Halaman Masuk dan Daftar (F1). Hanya email UGM yang diterima.
// Setelah berhasil, pengguna dikembalikan ke halaman asal (?next=/barang/xxx) atau ke Dashboard.
export default function Masuk() {
  const { user } = useSession()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const toast = useToast()
  const nextParam = params.get('next') ?? ''
  const next = nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/dashboard'

  const [mode, setMode] = useState(params.get('mode') === 'daftar' ? 'daftar' : 'masuk')
  const [form, setForm] = useState({ nama: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [pesan, setPesan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [cekEmail, setCekEmail] = useState(false)

  if (user && !cekEmail) return <Navigate to={next} replace />

  const ubah = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    setErrors((er) => ({ ...er, [k]: null }))
    setPesan(null)
  }

  function validasi() {
    const er = {}
    if (mode === 'daftar' && form.nama.trim().length < 2) er.nama = 'Tulis nama lengkapmu'
    if (!form.email.trim()) er.email = 'Email wajib diisi'
    else if (!UGM_EMAIL.test(form.email.trim())) er.email = 'Gunakan email UGM (@mail.ugm.ac.id atau @ugm.ac.id)'
    if (form.password.length < 6) er.password = 'Password minimal 6 karakter'
    setErrors(er)
    return Object.keys(er).length === 0
  }

  async function kirim(e) {
    e.preventDefault()
    if (!validasi()) return
    setLoading(true)
    const email = form.email.trim().toLowerCase()
    if (mode === 'masuk') {
      const res = await signIn(email, form.password)
      setLoading(false)
      if (res.error) {
        setPesan(/confirm/i.test(res.error) ? 'Email belum dikonfirmasi. Buka tautan yang kami kirim ke email UGM-mu.' : res.error)
        return
      }
      toast('Selamat datang kembali!')
      navigate(next, { replace: true })
    } else {
      const res = await signUp(email, form.password, form.nama.trim())
      setLoading(false)
      if (res.error) {
        setPesan(res.error)
        return
      }
      // Kalau konfirmasi email aktif di Supabase, sesi belum ada sampai email diklik.
      setCekEmail(true)
    }
  }

  if (cekEmail) {
    return (
      <Kartu>
        <Buddy type="charger" size={120} />
        <h1 className="text-2xl font-bold">Cek email UGM-mu</h1>
        <p className="text-sm text-ink-2">
          Kami mengirim tautan konfirmasi ke <b className="text-ink">{form.email}</b>. Klik tautannya, lalu kembali ke sini untuk masuk.
        </p>
        <Button full onClick={() => { setCekEmail(false); setMode('masuk') }}>Saya sudah konfirmasi, masuk</Button>
      </Kartu>
    )
  }

  return (
    <Kartu>
      <Buddy type="kalkulator" size={110} />
      <div>
        <h1 className="text-2xl font-bold">{mode === 'masuk' ? 'Masuk ke UGM Sharing' : 'Buat akun UGM Sharing'}</h1>
        <p className="mt-1 text-sm text-ink-2">Khusus mahasiswa UGM. Pinjam hemat, pinjamkan dapat cuan.</p>
      </div>

      <div className="w-full">
        <Segmented
          label="Pilih masuk atau daftar"
          options={[{ value: 'masuk', label: 'Masuk' }, { value: 'daftar', label: 'Daftar' }]}
          value={mode}
          onChange={(m) => { setMode(m); setErrors({}); setPesan(null) }}
        />
      </div>

      <form onSubmit={kirim} noValidate className="flex w-full flex-col gap-4 text-left">
        {mode === 'daftar' && (
          <Field label="Nama lengkap" autoComplete="name" value={form.nama} onChange={ubah('nama')} error={errors.nama} placeholder="Contoh: Kageyama Tobio" />
        )}
        <Field label="Email UGM" type="email" inputMode="email" autoComplete="email" value={form.email} onChange={ubah('email')} error={errors.email} placeholder="nama@mail.ugm.ac.id" />
        <Field
          label="Password"
          type="password"
          autoComplete={mode === 'masuk' ? 'current-password' : 'new-password'}
          value={form.password}
          onChange={ubah('password')}
          error={errors.password}
          hint={mode === 'daftar' ? 'Minimal 6 karakter' : undefined}
        />
        {pesan && <p role="alert" className="rounded-field bg-tint-coral px-4 py-3 text-sm text-danger">{pesan}</p>}
        <Button type="submit" full loading={loading}>{mode === 'masuk' ? 'Masuk' : 'Daftar'}</Button>
      </form>

      <p className="text-xs text-ink-2">
        Dengan {mode === 'masuk' ? 'masuk' : 'mendaftar'}, kamu setuju dengan aturan main di halaman Cara Kerja.
      </p>
    </Kartu>
  )
}

function Kartu({ children }) {
  return (
    <div className="bg-hero -mb-28 flex min-h-dvh items-start justify-center px-5 pt-10 pb-36 md:mb-0 md:min-h-[calc(100dvh-76px)] md:items-center md:pb-10">
      <div className="flex w-full max-w-md flex-col items-center gap-5 rounded-sheet bg-surface p-6 text-center shadow-float md:p-8">
        {children}
      </div>
    </div>
  )
}
