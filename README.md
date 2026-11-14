# UGM Sharing

> Pinjam dulu, beli kalau perlu.

Karya Kompetisi Web Design COMMIT 2026 · Tema: Optimasi Keuangan dan Gaya Hidup

## Tim

**Nama tim:** WC (Toilet) Keren

| Anggota | Peran | Tugas |
| --- | --- | --- |
| Beverly Marsya Yufuai | A · Product Lead, QA, dokumen | Survei pengguna, konten aplikasi, QA, laporan, dan presentasi |
| Aulia Dwi Novita | B · UI/UX, front-end, dan perbaikan database | Desain Figma, design system, halaman akun dan dashboard, data contoh, dan perbaikan database |
| Almira Raisya Nadhifah | C · Front-end katalog | Beranda, Katalog, Detail Barang, dan Ajukan Pinjam |
| Balqis Isma Nadhifa | D · Fullstack dan infrastruktur | Database Supabase, Auth, API, dan deploy |

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
- Desain Figma: `[isi link Figma]`
- Akun demo untuk juri:
  - Pemilik barang: `demo.pemilik@mail.ugm.ac.id` / `DemoJuri123!`
  - Peminjam: `demo.peminjam@mail.ugm.ac.id` / `DemoJuri123!`

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

- **AI:** Claude (Anthropic) dipakai untuk membantu menyusun rencana proyek, desain UI di Figma, penulisan komponen dan halaman front-end, data contoh, serta dokumentasi. `[tambahkan AI lain yang dipakai anggota, jika ada]`. Seluruh kode ditinjau, diuji, dan dipahami oleh anggota tim.
- **Template atau starter code:** template bawaan Vite (`npm create vite`) sebagai kerangka awal.
- **Font:** [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) dari Google Fonts, lisensi SIL Open Font License.
- **Ikon:** bentuk ikon mengikuti [Lucide](https://lucide.dev), lisensi ISC.
- **Ilustrasi maskot Buddy dan ilustrasi barang:** dibuat sendiri oleh tim.

## Keterbatasan

- Tidak ada pembayaran online. Pembayaran dan serah terima dilakukan langsung (COD) di area kampus.
- Verifikasi mahasiswa hanya lewat domain email UGM, belum lewat KTM.
- Deposit dan pengembalian barang dicatat, tetapi tidak dijamin oleh sistem.
- Barang contoh memakai ilustrasi, bukan foto asli. Barang yang dipasang pengguna memakai foto asli.
