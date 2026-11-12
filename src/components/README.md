# Komponen UI UGM Sharing

Semua komponen mengikuti file Figma (page Styleguide). Lihat contoh hidupnya di `/styleguide` saat `npm run dev`.

## Token (Tailwind)

Didefinisikan di `src/index.css` (`@theme`). Pakai kelasnya langsung, jangan hex manual:

- Warna: `bg-navy-700`, `bg-lime-400`, `text-ink`, `text-ink-2`, `bg-bg`, `bg-surface`, `ring-line`, `bg-tint-blue`
- Radius: `rounded-card` (20), `rounded-field` (12), `rounded-sheet` (28), `rounded-full` untuk pill
- Bayangan: `shadow-card`, `shadow-float`, `shadow-sheet`
- Gradien hero: kelas `bg-hero`. Angka rata kolom: `tabular`

## Komponen

| Komponen | Import | Catatan |
|---|---|---|
| Button, IconButton | `ui/Button` | `variant` primary, secondary, dark, ghost, danger. `to` untuk tautan internal, `href` untuk luar, `full`, `loading` |
| Badge, ListingBadges, BookingStatus, ItemStatus | `ui/Badge` | Status booking dan barang sudah punya warna sendiri |
| Field, Segmented | `ui/Field` | `as="textarea"` atau `"select"`, `prefix="Rp"`, `error`, `hint` |
| Sheet | `ui/Sheet` | Bottom sheet di HP, dialog di desktop. Untuk Ajukan Pinjam, Laporkan, konfirmasi |
| useToast | `ui/toast` | `toast('Tersimpan')` atau `toast(error, 'error')` |
| Skeleton, EmptyState, ErrorState | `ui/States` | Pakai di setiap daftar: muat, kosong, gagal |
| Icon | `ui/Icon` | `name`: home, grid, search, heart, calendar, pin, star, dll. |
| Buddy | `buddy/Buddy` | `type` kalkulator, kamera, charger, jaslab, violet. Matanya otomatis ikut kursor/jari |
| buddyForCategory, BUDDY_TINT | `buddy/buddyMap` | Pilih maskot dan warna latar dari `item.category` |
| ItemCard, ItemCardSkeleton | `items/ItemCard` | Terima `item` sesuai bentuk `getItems()`. Opsional `saved`, `onToggleSaved` |
| AppShell | `layout/AppShell` | Navbar desktop + bottom nav HP. Semua halaman di dalamnya lewat `App.jsx` |

## Format

`lib/format.js`: `rupiah(8000)` jadi `Rp8.000`, `rupiahRingkas(12400000)` jadi `Rp12,4 jt`, `rentangTanggal('2026-11-14', '2026-11-16')` jadi `14-16 Nov · 3 hari`.

## Halaman

Rute ada di `src/App.jsx`. Halaman yang masih `Placeholder` diganti pemiliknya: ganti `element={<Placeholder ... />}` dengan halaman asli. Halaman tes backend lama sekarang di `/tes-backend`.
