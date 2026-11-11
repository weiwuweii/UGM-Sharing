# Kontrak API UGM Sharing

Semua fungsi ada di `src/lib/api/`, bersifat async, dan mengembalikan `{ data, error }`.
- `error` adalah `null` kalau sukses, atau teks pesan (bahasa Indonesia) kalau gagal.
- Nama field mengikuti nama kolom database (snake_case).
- Tanggal berformat "YYYY-MM-DD". Harga berupa angka bulat rupiah.
- Perubahan kontrak harus disepakati di grup dulu.

## Akun (auth.js)

| Fungsi | Masuk | data (kalau sukses) |
| --- | --- | --- |
| signUp(email, password, fullName) | email wajib UGM | { id, email } |
| signIn(email, password) | | { id, email } |
| signOut() | | null |
| getCurrentUser() | | { id, email } atau null kalau belum login |
| updateMyProfile({ full_name, faculty, whatsapp }) | | profil terbaru |
| getProfile(userId) | | { profile: {id, full_name, faculty, avatar_url, rating_avg, review_count}, items: [item], reviews: [review] } |

## Barang (items.js)

| Fungsi | Masuk | data (kalau sukses) |
| --- | --- | --- |
| getItems(filters) | { search, category, type, minPrice, maxPrice, location, condition, available, sort, page } | [item], dan field `total` di luar data |
| getItem(id) | id barang | item lengkap + description + owner + booked_ranges |
| createItem(data, files) | data form, files maksimal 4 foto (sudah dikompres) | item baru |
| updateItem(id, data) | field yang diubah, status "nonaktif" untuk menonaktifkan | item terbaru |

Catatan filters:
- type: "pinjam" | "jual" | "keduanya"
- condition: "baru" | "seperti_baru" | "baik" | "layak_pakai"
- available: true = hanya yang berstatus tersedia
- sort: "terbaru" | "termurah" | "termahal"
- page: mulai dari 1, isi 12 barang per halaman
- Semua filter boleh kosong.

Bentuk `item` (untuk daftar):
id, title, category, listing_type, retail_price, rent_price_per_day, sale_price, deposit, condition, location, photos (array URL), status, created_at, owner: { id, full_name, faculty }

Tambahan pada getItem:
description, owner.avatar_url, owner.rating_avg (angka atau null), owner.review_count, booked_ranges: [{ start_date, end_date }] (tanggal yang sudah terpakai, untuk kalender)

## Booking (bookings.js)

| Fungsi | Masuk | data (kalau sukses) |
| --- | --- | --- |
| createBooking(itemId, type, startDate, endDate, note) | type "pinjam" atau "beli". Untuk "beli", tanggal diisi null | booking baru (status "pending") |
| updateBookingStatus(id, status) | "disetujui" / "ditolak" / "selesai" / "dibatalkan" | booking terbaru |
| getContact(bookingId) | | { whatsapp } (hanya berhasil kalau booking "disetujui" dan kamu pihak terkait) |

Contoh pesan error createBooking: "Silakan login dulu", "Tidak bisa meminjam barang sendiri", "Tanggal sudah dipakai orang lain".

## Dashboard (dashboard.js)

| Fungsi | data (kalau sukses) |
| --- | --- |
| getMyDashboard() | { my_items: [item], incoming_requests: [booking], my_requests: [booking], history: [booking], total_saved: angka, total_income: angka } |

Bentuk `booking` di daftar:
id, type, start_date, end_date, note, status, saved_amount, created_at, item: { id, title, photo }, borrower: { id, full_name } (untuk incoming_requests), owner: { id, full_name } (untuk my_requests)

## Lain-lain

| Fungsi | Masuk | data (kalau sukses) |
| --- | --- | --- |
| createReview(bookingId, rating, comment) | rating 1 sampai 5 | ulasan baru |
| toggleWishlist(itemId) | | { saved: true atau false } |
| reportItem(itemId, reason) | | { id } |
| getStats() | | { total_items, completed_transactions, total_saved_community } |

## Pakai mock dulu

Sebelum backend asli jadi, buat fungsi tiruan dengan nama dan bentuk yang sama persis. Saat yang asli sudah ada, hanya satu baris di `src/lib/api/index.js` yang diganti.