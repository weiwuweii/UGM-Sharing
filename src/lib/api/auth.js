import { supabase } from '../supabase'

const UGM_EMAIL = /@(mail\.)?ugm\.ac\.id$/i

export async function signUp(email, password, fullName) {
  if (!UGM_EMAIL.test(email)) {
    return { data: null, error: 'Gunakan email UGM (@mail.ugm.ac.id atau @ugm.ac.id)' }
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  })
  if (error) {
    return { data: null, error: terjemahkanError(error.message) }
  }
  return { data: { id: data.user.id, email: data.user.email }, error: null }
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    return { data: null, error: terjemahkanError(error.message) }
  }
  return { data: { id: data.user.id, email: data.user.email }, error: null }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { data: null, error: error ? error.message : null }
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getSession()
  const user = data.session?.user
  return { data: user ? { id: user.id, email: user.email } : null, error: null }
}

export async function updateMyProfile({ full_name, faculty, whatsapp }) {
  const { data: sesi } = await supabase.auth.getSession()
  const user = sesi.session?.user
  if (!user) return { data: null, error: 'Silakan login dulu' }

  const { data, error } = await supabase
    .from('profiles')
    .update({ full_name, faculty, whatsapp })
    .eq('id', user.id)
    .select('id, full_name, faculty, avatar_url')
    .single()

  return { data, error: error ? error.message : null }
}

function terjemahkanError(pesan) {
  if (pesan.includes('Invalid login credentials')) return 'Email atau password salah'
  if (pesan.includes('already registered')) return 'Email ini sudah terdaftar'
  if (pesan.includes('Password should be')) return 'Password minimal 6 karakter'
  if (pesan.includes('Database error')) return 'Gunakan email UGM (@mail.ugm.ac.id atau @ugm.ac.id)'
  return pesan
}