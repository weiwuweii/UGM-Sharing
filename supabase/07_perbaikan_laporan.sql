-- 07. Perbaikan fitur Laporkan barang.
-- Saat laporan dikirim, aplikasi membaca kembali baris yang baru disimpan.
-- Tanpa izin baca, Supabase menolak dengan "new row violates row-level security policy".
-- Pelapor hanya bisa melihat laporannya sendiri; laporan orang lain tetap tersembunyi.

drop policy if exists "lihat laporan sendiri" on public.reports;
create policy "lihat laporan sendiri" on public.reports
  for select to authenticated
  using (auth.uid() = reporter_id);
