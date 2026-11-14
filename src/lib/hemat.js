// Rumus Kalkulator Hemat (blueprint bagian 4.3). Fungsi murni supaya mudah diuji.
// Contoh uji (retail 280.000, sewa 8.000/hari):
//   1 hari  -> biaya 8.000,   hemat 272.000
//   3 hari  -> biaya 24.000,  hemat 256.000
//   40 hari -> biaya 320.000, hemat -40.000 (lebih murah beli). Titik impas = 35 hari.
export function hitungHemat({ retail, sewaPerHari, hari }) {
  const biayaPinjam = sewaPerHari * hari
  const hemat = retail > 0 ? retail - biayaPinjam : 0
  const titikImpas = sewaPerHari > 0 && retail > 0 ? Math.ceil(retail / sewaPerHari) : null
  return { biayaPinjam, hemat, titikImpas }
}

// Hemat membeli bekas dibanding beli baru
export function hematBeli(retail, hargaJual) {
  return retail > 0 && hargaJual > 0 ? retail - hargaJual : 0
}