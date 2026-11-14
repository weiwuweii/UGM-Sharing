import { supabase } from '../supabase'

function rapikanError(error) {
  if (error.message.includes('permission denied')) return 'Silakan login dulu'
  return error.message
}

export async function getMyDashboard() {
  const { data, error } = await supabase.rpc('get_my_dashboard')
  if (error) return { data: null, error: rapikanError(error) }
  return { data, error: null }
}

export async function getStats() {
  const { data, error } = await supabase.rpc('get_stats')
  if (error) return { data: null, error: error.message }
  return { data, error: null }
}
// Jumlah mahasiswa yang sudah punya akun (akun demo juri tidak dihitung)
export async function getJumlahPengguna() {
  const { count, error } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .not('full_name', 'ilike', 'demo%')
  if (error) return { data: null, error: error.message }
  return { data: count ?? 0, error: null }
}
