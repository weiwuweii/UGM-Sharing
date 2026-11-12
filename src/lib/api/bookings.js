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


export async function updateBookingStatus(id, status) {
  const { data, error } = await supabase.rpc('update_booking_status', {
    p_booking_id: id,
    p_status: status,
  })
  if (error) return { data: null, error: rapikanError(error) }
  return { data, error: null }
}

export async function getContact(bookingId) {
  const { data, error } = await supabase.rpc('get_contact', { p_booking_id: bookingId })
  if (error) return { data: null, error: rapikanError(error) }

  const kontak = data?.[0]
  if (!kontak || !kontak.whatsapp) {
    return { data: null, error: 'Pihak lawan belum mengisi nomor WhatsApp' }
  }

  // Rapikan nomor: 0812xxx menjadi 62812xxx supaya cocok dengan link wa.me
  let nomor = String(kontak.whatsapp).replace(/\D/g, '')
  if (nomor.startsWith('0')) nomor = '62' + nomor.slice(1)

  return {
    data: { whatsapp: nomor, full_name: kontak.full_name, link: 'https://wa.me/' + nomor },
    error: null,
  }
}