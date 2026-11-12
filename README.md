# UGM Sharing

> Pinjam dulu, beli kalau perlu.

Karya Kompetisi Web Design COMMIT 2026 · Tema: Optimasi Keuangan dan Gaya Hidup

## Tim

**Nama tim:** `[isi nama tim]`

| Anggota | Peran |
| --- | --- |
| `[nama]` | A · Product Lead, QA, dokumen |
| `[nama]` | B · UI/UX dan front-end UI |
| `[nama]` | C · Front-end katalog (Beranda, Katalog, Detail) |
| `[nama]` | D · Fullstack dan infrastruktur (Supabase, Auth, Booking, deploy) |

## Tentang

Mahasiswa sering butuh barang mahal yang hanya dipakai sebentar, seperti kalkulator ilmiah untuk ujian, kamera untuk tugas, charger, atau jas lab. Di sisi lain, banyak barang serupa menganggur di kos teman. UGM Sharing adalah platform pinjam dan beli barang antarmahasiswa UGM, supaya peminjam bisa hemat dan pemilik dapat pemasukan tambahan.

### Fitur utama

- **Akun email UGM:** daftar dan masuk hanya dengan email `@mail.ugm.ac.id` atau `@ugm.ac.id`.
- **Katalog:** cari dan filter barang berdasarkan kategori, tipe (pinjam/beli), harga, lokasi, kondisi, dan ketersediaan.
- **Detail barang dan Kalkulator Hemat:** bandingkan biaya pinjam dengan harga beli baru, lengkap dengan titik impas.
- **Pasang barang:** unggah hingga 4 foto, atur harga sewa, harga jual, dan deposit.
- **Request pinjam atau beli:** pilih tanggal, pemilik menyetujui atau menolak, tanggal yang sudah terpakai tidak bisa dipesan lagi.
- **Kontak WhatsApp terlindungi:** nomor pemilik hanya terbuka setelah request disetujui.
- **Dashboard:** total hemat, pemasukan, request masuk, request saya, barang saya, dan riwayat.
- **Ulasan, simpan barang, dan laporan barang.**

## Teknologi

- **Front-end:** React 19, Vite, Tailwind CSS 4, React Router
- **Back-end:** Supabase (PostgreSQL, Auth, Storage, Row Level Security, fungsi RPC)
- **Deploy:** Vercel (`vercel.json` mengarahkan semua rute ke `index.html`)
- **Desain:** Figma

## Menjalankan secara lokal

Kebutuhan: Node.js 20 atau lebih baru dan sebuah project Supabase.

1. Clone dan pasang dependensi:
   ```bash
   git clone https://github.com/weiwuweii/WC-Toilet-Keren-COMMIT.git
   cd WC-Toilet-Keren-COMMIT
   npm install
   ```
2. Siapkan database. Di Supabase SQL Editor, jalankan berurutan:
   `supabase/01_schema.sql`, `supabase/02_policies_and_storage.sql`, `supabase/03_functions.sql`, `supabase/04_rls_policies.sql`, `supabase/05_perbaikan_keamanan.sql`.
3. Salin contoh konfigurasi, lalu isi URL dan anon key dari Supabase (Project Settings, API):
   ```bash
   cp .env.example .env
   ```
4. Jalankan:
   ```bash
   npm run dev
   ```
   Buka alamat yang muncul di terminal (biasanya http://localhost:5173).

Perintah lain: `npm run build` untuk build produksi, `npm run lint` untuk cek kode.

## Tautan

- Website: `[isi link Vercel]`
- Akun demo untuk juri: `[isi email dan password akun demo]`

## Arsitektur teknis dan back-end

Aplikasi memakai arsitektur serverless: front-end React di Vercel memanggil Supabase langsung. Semua fungsi pemanggil API ada di `src/lib/api/` dan didokumentasikan di `API_CONTRACT.md`.

Folder `supabase/`:

- `01_schema.sql`: tabel `profiles`, `items`, `bookings`, `reviews`, `wishlists`, `reports`, serta index untuk pencarian katalog dan pengecekan jadwal.
- `02_policies_and_storage.sql`: bucket foto `item-photos` (maksimal 1 MB per foto, hanya gambar) dan aturan aksesnya.
- `03_functions.sql`: fungsi RPC untuk logika penting:
  - `create_booking`: validasi login, mencegah meminjam barang sendiri, cek bentrok tanggal, dan menghitung `saved_amount` untuk Kalkulator Hemat.
  - `update_booking_status`: alur status `pending` ke `disetujui`, `ditolak`, atau `dibatalkan`, lalu `selesai`, sesuai hak pemilik dan peminjam.
  - `get_contact`: membuka nomor WhatsApp hanya setelah booking disetujui, dan hanya untuk pihak terkait.
  - Trigger di `auth.users`: menolak email non-UGM dan membuat profil otomatis saat daftar.
- `04_rls_policies.sql`: Row Level Security di semua tabel.
- `05_perbaikan_keamanan.sql`: nomor WhatsApp hanya bisa diambil lewat `get_contact`, ulasan hanya lewat `create_review` setelah transaksi selesai, serta fungsi `get_stats` dan `get_public_profile`.
- `tools/ekspor_dari_supabase.sql`: query baca-saja untuk menyalin fungsi dan policy dari project Supabase ke file di atas.

## Penggunaan AI, template, dan aset pihak ketiga

- **AI:** `[lengkapi per anggota]`. Contoh: Claude (Anthropic) dipakai untuk menyusun rencana proyek, desain UI di Figma, komponen UI front-end, dan membantu dokumentasi. Seluruh kode ditinjau dan dipahami oleh anggota tim.
- **Template atau starter code:** template bawaan Vite (`npm create vite`) sebagai kerangka awal.
- **Font:** [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) dari Google Fonts, lisensi SIL Open Font License.
- **Ikon:** bentuk ikon mengikuti [Lucide](https://lucide.dev), lisensi ISC.
- **Ilustrasi maskot Buddy:** dibuat sendiri oleh tim.

## Keterbatasan

- Tidak ada pembayaran online. Pembayaran dan serah-terima dilakukan langsung (COD) di area kampus.
- Verifikasi mahasiswa hanya lewat domain email UGM, belum lewat KTM.
- Deposit dan pengembalian barang dicatat, tetapi tidak dijamin oleh sistem.
