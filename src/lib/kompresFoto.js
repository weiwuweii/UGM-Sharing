// Mengecilkan foto di browser sebelum diunggah, supaya di bawah batas 1 MB.
// Foto dari kamera HP biasanya 3-8 MB; hasilnya JPEG maksimal 1280 px.
export async function kompresFoto(file, { maxSisi = 1280, maxBytes = 950 * 1024 } = {}) {
  if (!file.type.startsWith('image/')) throw new Error('File harus berupa gambar')
  const bitmap = await createImageBitmap(file).catch(() => null)
  if (!bitmap) throw new Error('Format foto tidak didukung. Coba JPG atau PNG.')

  let sisi = maxSisi
  for (let percobaan = 0; percobaan < 5; percobaan++) {
    const skala = Math.min(1, sisi / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * skala)
    canvas.height = Math.round(bitmap.height * skala)
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', 0.82))
    if (blob && blob.size <= maxBytes) {
      const nama = file.name.replace(/\.[^.]+$/, '') + '.jpg'
      return new File([blob], nama, { type: 'image/jpeg' })
    }
    sisi = Math.round(sisi * 0.75)
  }
  throw new Error('Foto terlalu besar, coba foto lain')
}
