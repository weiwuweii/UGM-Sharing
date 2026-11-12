-- Bucket foto: publik untuk dilihat, maksimal 1 MB per file, hanya gambar
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('item-photos', 'item-photos', true, 1048576, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update
  set file_size_limit = 1048576,
      allowed_mime_types = array['image/jpeg','image/png','image/webp'];

-- Siapa saja boleh melihat foto
drop policy if exists "foto barang bisa dilihat publik" on storage.objects;
create policy "foto barang bisa dilihat publik" on storage.objects
  for select using (bucket_id = 'item-photos');

-- User yang login hanya boleh mengunggah ke folder bernama id-nya sendiri
drop policy if exists "upload foto ke folder sendiri" on storage.objects;
create policy "upload foto ke folder sendiri" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'item-photos' and (storage.foldername(name))[1] = auth.uid()::text);

-- Dan hanya boleh menghapus foto di folder sendiri
drop policy if exists "hapus foto sendiri" on storage.objects;
create policy "hapus foto sendiri" on storage.objects
  for delete to authenticated
  using (bucket_id = 'item-photos' and (storage.foldername(name))[1] = auth.uid()::text);