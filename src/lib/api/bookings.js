import { supabase } from '../supabase'

function rapikanError(error) {
  if (error.message.includes('permission denied')) return 'Silakan login dulu'
  return error.message
}

export async function createBooking(itemId, type, startDate, endDate, note = '') {
  const { data, error } = await supabase.rpc('create_booking', {
    p_item_id: itemId,
    p_type: type,
    p_start: startDate || null,
    p_end: endDate || null,
    p_note: note || null,
  })
  if (error) return { data: null, error: rapikanError(error) }
  return { data, error: null }
}