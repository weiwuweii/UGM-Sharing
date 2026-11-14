// Teks halaman Cara Kerja. Edit di sini kalau mau ganti kata-kata; tampilannya ada di src/pages/CaraKerja.jsx.
// Aturan di bawah mengikuti yang benar-benar dijalankan sistem (lihat supabase/03_functions.sql).

export const LANGKAH_PEMINJAM = [
  { judul: 'Cari barang', teks: 'Buka Katalog dan cari barang yang kamu butuhkan, dari kalkulator ilmiah sampai jas lab.', buddy: 'kalkulator' },
  { judul: 'Hitung hematnya', teks: 'Di halaman barang, Kalkulator Hemat membandingkan biaya pinjam dengan harga beli baru.', buddy: 'kamera' },
  { judul: 'Ajukan pinjam', teks: 'Pilih tanggal, tulis catatan singkat untuk pemilik, lalu kirim request.', buddy: 'charger' },
  { judul: 'Ambil dan kembalikan', teks: 'Setelah disetujui, nomor WhatsApp pemilik terbuka. Atur lokasi dan waktu ambil lewat chat.', buddy: 'jaslab' },
]

export const LANGKAH_PEMILIK = [
  { judul: 'Pasang barang', teks: 'Unggah foto, isi kondisi, dan tentukan harga pinjam per hari atau harga jual.' },
  { judul: 'Tinjau request', teks: 'Request masuk muncul di Dashboard. Kamu yang memutuskan: setujui atau tolak.' },
  { judul: 'Serah terima', teks: 'Setelah kamu setujui, kontak peminjam terbuka. Tandai Selesai saat barang sudah kembali.' },
]

export const ATURAN = [
  {
    judul: 'Akun dan keamanan',
    butir: [
      'Hanya mahasiswa UGM yang bisa mendaftar, memakai email @mail.ugm.ac.id atau @ugm.ac.id.',
      'Nomor WhatsApp pemilik dan peminjam baru terbuka setelah request disetujui. Sebelum itu nomor tetap tersembunyi.',
      'Jangan membagikan nomor orang lain atau memakai kontak untuk hal di luar transaksi barang.',
    ],
  },
  {
    judul: 'Aturan peminjaman',
    butir: [
      'Satu request bisa untuk maksimal 30 hari.',
      'Tanggal mulai tidak boleh sudah lewat, dan tanggal selesai tidak boleh sebelum tanggal mulai.',
      'Tanggal yang sudah dipakai request lain yang disetujui tidak bisa dipilih.',
      'Kamu tidak bisa meminjam atau membeli barangmu sendiri.',
      'Peminjam bisa membatalkan request selama masih menunggu atau sudah disetujui.',
      'Hanya pemilik yang bisa menyetujui, menolak, atau menandai pinjaman Selesai.',
    ],
  },
  {
    judul: 'Aturan pembelian',
    butir: [
      'Beli hanya untuk barang yang ditandai dijual oleh pemiliknya.',
      'Satu barang hanya bisa diajukan satu kali oleh orang yang sama selama request-nya masih berjalan.',
      'Harga dan cara pembayaran disepakati langsung lewat WhatsApp setelah disetujui.',
    ],
  },
  {
    judul: 'Kondisi, deposit, dan kerusakan',
    butir: [
      'Pemilik wajib menulis kondisi barang dengan jujur: baru, seperti baru, baik, atau layak pakai.',
      'Cek barang bersama saat serah terima. Foto kondisinya kalau perlu.',
      'Deposit, jika ada, tertera di halaman barang dan diserahkan saat ambil barang.',
      'Kalau barang rusak atau hilang, peminjam dan pemilik menyelesaikannya secara kekeluargaan lewat chat. UGM Sharing tidak memegang uang.',
    ],
  },
  {
    judul: 'Ulasan',
    butir: [
      'Setelah pinjaman Selesai, kamu bisa memberi bintang dan ulasan untuk pihak lawan.',
      'Tulis ulasan yang jujur dan sopan. Ulasan membantu mahasiswa lain memutuskan.',
    ],
  },
]

export const FAQ = [
  { t: 'Apakah UGM Sharing gratis?', j: 'Memakai platform gratis. Biaya pinjam atau harga jual ditentukan pemilik barang, dan dibayar langsung antar mahasiswa.' },
  { t: 'Siapa yang bisa memakai?', j: 'Mahasiswa UGM dengan email UGM. Verifikasi dilakukan saat mendaftar.' },
  { t: 'Kapan saya bisa menghubungi pemilik?', j: 'Setelah request disetujui, tombol WhatsApp terbuka di Dashboard. Sebelum itu, kirim request dan tulis catatan untuk pemilik.' },
  { t: 'Bagaimana kalau request saya ditolak?', j: 'Kamu bisa mencoba tanggal lain atau mencari barang serupa di Katalog.' },
  { t: 'Bagaimana kalau barang rusak atau hilang?', j: 'Bicarakan dengan pemilik lewat WhatsApp dan sepakati penggantiannya. Karena itu, cek kondisi barang bersama saat serah terima.' },
  { t: 'Bagaimana cara mengembalikan barang?', j: 'Atur waktu dan tempat dengan pemilik lewat chat. Setelah barang kembali, pemilik menandai pinjaman Selesai.' },
  { t: 'Apa itu titik impas di Kalkulator Hemat?', j: 'Jumlah hari pinjam ketika total biaya pinjam sama dengan harga beli baru. Selama masih di bawahnya, meminjam lebih murah.' },
]
