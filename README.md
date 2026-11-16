# UGM Sharing

> Pinjam dulu, beli kalau perlu.

Karya Kompetisi Web Design COMMIT 2026 · Tema: Optimasi Keuangan dan Gaya Hidup

## Tim

**Nama tim:** WC (Toilet) Keren

| Anggota | Peran | Tugas |
| --- | --- | --- |
| Beverly Marsya Yufuai | Product Lead, QA, dokumen | Survei pengguna, konten aplikasi, QA, laporan, dan presentasi |
| Aulia Dwi Novita | UI/UX, front-end, dan perbaikan database | Desain Figma, design system, halaman akun dan dashboard, data contoh, dan perbaikan database |
| Almira Raisya Nadhifah | Front-end katalog | Beranda, Katalog, Detail Barang, dan Ajukan Pinjam |
| Balqis Isma Nadhifa | Fullstack dan infrastruktur | Database Supabase, Auth, API, dan deploy |

## Tentang

Mahasiswa sering butuh barang mahal yang hanya dipakai sebentar, seperti kalkulator ilmiah untuk ujian, kamera untuk tugas, charger, atau jas lab. Di sisi lain, banyak barang serupa menganggur di kos teman. UGM Sharing adalah platform pinjam dan beli barang antarmahasiswa UGM, supaya peminjam bisa hemat dan pemilik dapat pemasukan tambahan.

### Fitur utama

- **Akun email UGM:** daftar dan masuk hanya dengan email `@mail.ugm.ac.id` atau `@ugm.ac.id`.
- **Katalog:** cari dan filter barang berdasarkan kategori, tipe (pinjam/beli), harga, lokasi, kondisi, dan ketersediaan.
- **Detail barang dan Kalkulator Hemat:** bandingkan biaya pinjam dengan harga beli baru, lengkap dengan titik impas.
- **Pasang barang:** unggah hingga 4 foto (otomatis dikecilkan di browser), atur harga sewa, harga jual, dan deposit.
- **Request pinjam atau beli:** pilih tanggal, pemilik menyetujui atau menolak, tanggal yang sudah terpakai tidak bisa dipesan lagi.
- **Kontak WhatsApp terlindungi:** nomor pemilik hanya terbuka setelah request disetujui.
- **Dashboard:** total hemat, pemasukan, request masuk, request saya, barang saya, dan riwayat.
- **Profil publik:** barang yang dipasang, rating, dan ulasan setiap pengguna.
- **Profil, ulasan, simpan barang, dan laporan barang.**
- **Cara Kerja:** alur pinjam dan menyewakan, aturan main, dan FAQ.

## Teknologi

- **Front-end:** React 19, Vite, Tailwind CSS 4, React Router
- **Back-end:** Supabase (PostgreSQL, Auth, Storage, Row Level Security, fungsi RPC)
- **Deploy:** Vercel (`vercel.json` mengarahkan semua rute ke `index.html`)
- **Desain:** Figma

## Menjalankan secara lokal

Kebutuhan: Node.js 20 atau lebih baru dan sebuah project Supabase.

1. Clone dan pasang dependensi:
   ```bash
   git clone https://github.com/weiwuweii/UGM-Sharing.git
   cd UGM-Sharing
   npm install
   ```
2. Siapkan database. Di Supabase SQL Editor, jalankan berurutan:
   `supabase/01_schema.sql`, `supabase/02_policies_and_storage.sql`, `supabase/03_functions.sql`, `supabase/04_rls_policies.sql`, `supabase/05_perbaikan_keamanan.sql`, `supabase/07_perbaikan_laporan.sql`.
3. Salin contoh konfigurasi, lalu isi URL dan anon key dari Supabase (Project Settings, API):
   ```bash
   cp .env.example .env
   ```
4. Jalankan:
   ```bash
   npm run dev
   ```
   Buka alamat yang muncul di terminal (biasanya http://localhost:5173).
5. Opsional, isi data contoh: daftarkan minimal satu akun lewat halaman Daftar, lalu jalankan `supabase/06_data_contoh.sql` di SQL Editor. Sebanyak 40 barang contoh akan dibagi ke akun yang ada.

Perintah lain: `npm run build` untuk build produksi, `npm run lint` untuk cek kode.

## Tautan

- Website: https://ugm-sharing.vercel.app
- Desain Figma: https://www.figma.com/design/FYf25CXB2DotmJEx3fEGbv/UGM-Sharing-%E2%80%94-Design--COMMIT-2026-?node-id=25-43&t=AOKqz8YuRbadCrWZ-1
- Akun demo untuk juri:
  - Pemilik barang: `demo.pemilik@mail.ugm.ac.id` / `DemoJuri123!`
  - Peminjam: `demo.peminjam@mail.ugm.ac.id` / `DemoJuri123!`
  - Cara mencoba: masuk sebagai peminjam, buka profil "demo.pemilik" (atau barang miliknya), ajukan pinjam, lalu masuk sebagai pemilik untuk menyetujui di Dashboard.

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
- `06_data_contoh.sql`: 40 barang contoh dengan ilustrasi yang sesuai (gambar di `public/barang/`).
- `07_perbaikan_laporan.sql`: izin bagi pelapor untuk membaca laporannya sendiri, supaya fitur Laporkan barang bisa dipakai.
- `tools/ekspor_dari_supabase.sql`: query baca-saja untuk menyalin fungsi dan policy dari project Supabase ke file di atas.

## Penggunaan AI, template, dan aset pihak ketiga

**AI: Claude (Anthropic) dan Gemini (Google).** Proyek dikerjakan dengan bantuan AI. Tim tetap menentukan ide, fitur, alur, dan arah desain, lalu meninjau, menguji, dan merevisi hasilnya. Bagian yang dibantu:

- **Perencanaan:** pembagian tugas, timeline, dan rincian fitur.
- **Desain UI/UX:** layar di Figma, design system, dan maskot Buddy beserta mata yang mengikuti kursor, berdasarkan referensi visual yang dipilih tim.
- **Front-end:** komponen dan halaman React (Beranda, Katalog, Detail, Dashboard, Masuk/Daftar, Pasang Barang, Profil, Cara Kerja).
- **Back-end dan database:** penulisan kueri kompleks untuk kebijakan Row Level Security (RLS) dan fungsi Remote Procedure Call (RPC) di PostgreSQL, optimasi integrasi API di `src/lib/api/`, serta debugging selama penyambungan ke Supabase.
- **Konten dan data:** teks aplikasi, aturan, FAQ, data dummy untuk pengujian alur transaksi, 40 barang contoh, dan ilustrasi barang (`public/barang/`).

**Template atau starter code:** template bawaan Vite (`npm create vite`) sebagai kerangka awal.

**Aset pihak ketiga:**
- Font [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) dari Google Fonts, lisensi SIL Open Font License.
- Bentuk ikon mengikuti [Lucide](https://lucide.dev), lisensi ISC.

## Keterbatasan

- Tidak ada pembayaran online. Pembayaran dan serah terima dilakukan langsung (COD) di area kampus.
- Verifikasi mahasiswa hanya lewat domain email UGM, belum lewat KTM.
- Deposit dan pengembalian barang dicatat, tetapi tidak dijamin oleh sistem.
- Barang contoh memakai ilustrasi, bukan foto asli. Barang yang dipasang pengguna memakai foto asli.
