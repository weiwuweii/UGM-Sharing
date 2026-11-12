-- 04. Row Level Security untuk tabel public.
-- Disalin dari project Supabase produksi (12 Nov 2026).
-- Catatan: policy "profil bisa dibaca semua" dan "tulis ulasan sendiri" diperbaiki di 05_perbaikan_keamanan.sql.

alter table public.bookings enable row level security;
alter table public.items enable row level security;
alter table public.profiles enable row level security;
alter table public.reports enable row level security;
alter table public.reviews enable row level security;
alter table public.wishlists enable row level security;
drop policy if exists "lihat booking terkait" on public.bookings;
create policy "lihat booking terkait" on public.bookings as PERMISSIVE for SELECT to authenticated using (((auth.uid() = borrower_id) OR (auth.uid() IN ( SELECT items.owner_id
   FROM items
  WHERE (items.id = bookings.item_id)))));

drop policy if exists "katalog bisa dibaca publik" on public.items;
create policy "katalog bisa dibaca publik" on public.items as PERMISSIVE for SELECT to public using (true);

drop policy if exists "pemilik hapus barang" on public.items;
create policy "pemilik hapus barang" on public.items as PERMISSIVE for DELETE to authenticated using ((auth.uid() = owner_id));

drop policy if exists "pemilik tambah barang" on public.items;
create policy "pemilik tambah barang" on public.items as PERMISSIVE for INSERT to authenticated with check ((auth.uid() = owner_id));

drop policy if exists "pemilik ubah barang" on public.items;
create policy "pemilik ubah barang" on public.items as PERMISSIVE for UPDATE to authenticated using ((auth.uid() = owner_id)) with check ((auth.uid() = owner_id));

drop policy if exists "profil bisa dibaca semua" on public.profiles;
create policy "profil bisa dibaca semua" on public.profiles as PERMISSIVE for SELECT to public using (true);

drop policy if exists "ubah profil sendiri" on public.profiles;
create policy "ubah profil sendiri" on public.profiles as PERMISSIVE for UPDATE to authenticated using ((auth.uid() = id)) with check ((auth.uid() = id));

drop policy if exists "kirim laporan" on public.reports;
create policy "kirim laporan" on public.reports as PERMISSIVE for INSERT to authenticated with check ((auth.uid() = reporter_id));

drop policy if exists "tulis ulasan sendiri" on public.reviews;
create policy "tulis ulasan sendiri" on public.reviews as PERMISSIVE for INSERT to authenticated with check ((auth.uid() = reviewer_id));

drop policy if exists "ulasan bisa dibaca publik" on public.reviews;
create policy "ulasan bisa dibaca publik" on public.reviews as PERMISSIVE for SELECT to public using (true);

drop policy if exists "hapus wishlist sendiri" on public.wishlists;
create policy "hapus wishlist sendiri" on public.wishlists as PERMISSIVE for DELETE to authenticated using ((auth.uid() = user_id));

drop policy if exists "lihat wishlist sendiri" on public.wishlists;
create policy "lihat wishlist sendiri" on public.wishlists as PERMISSIVE for SELECT to authenticated using ((auth.uid() = user_id));

drop policy if exists "tambah wishlist sendiri" on public.wishlists;
create policy "tambah wishlist sendiri" on public.wishlists as PERMISSIVE for INSERT to authenticated with check ((auth.uid() = user_id));

