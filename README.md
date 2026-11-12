## Arsitektur Teknis & Backend

Aplikasi ini dibangun menggunakan arsitektur *Serverless* dengan rincian teknologi sebagai berikut:
- **Frontend:** React + Vite (di-hosting di Vercel dengan konfigurasi SPA routing via `vercel.json`)
- **Backend & Database:** Supabase (PostgreSQL, Supabase Auth, Supabase Storage, dan PostgreSQL RPC Functions)

### Struktur Folder Database (`/supabase`)
Seluruh skema dan aturan keamanan database terdokumentasi di dalam folder `supabase/` agar mudah direproduksi:
- `01_schema.sql`: Definisi tabel relasional (`profiles`, `items`, `bookings`, `reviews`, `wishlists`, `reports`) beserta *Database Indexing* pada kolom kategori, status, pemilik, dan rentang tanggal untuk mempercepat pencarian katalog.
- `02_policies_and_storage.sql`: Konfigurasi *Row Level Security (RLS)* pada seluruh tabel publik serta kebijakan akses bucket `item-photos` (maksimal 4 foto per barang).
- `03_functions.sql`: Fungsi RPC *Security Definer* untuk logika bisnis krusial:
  - `create_booking`: Validasi autentikasi, pencegahan peminjaman barang sendiri, pengecekan bentrok tanggal (*overlap*), dan perhitungan otomatis *Kalkulator Hemat* (`saved_amount`).
  - `update_booking_status`: Pengaturan alur transisi status transaksi (`pending` $\rightarrow$ `disetujui`/`ditolak`/`dibatalkan` $\rightarrow$ `selesai`) sesuai hak akses pemilik dan peminjam.
  - `get_contact`: Perlindungan privasi nomor WhatsApp yang hanya membuka akses kontak setelah status booking `disetujui` bagi pihak terkait.

### Cara Instalasi Lokal
1. Clone repositori ini:
   ```bash
   git clone <url-repo-github-kamu>
   cd WC-Toilet-Keren-COMMIT