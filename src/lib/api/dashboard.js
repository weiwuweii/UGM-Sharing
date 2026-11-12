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