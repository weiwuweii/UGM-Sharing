-- 05. Perbaikan keamanan dan fungsi yang belum ada.
-- Jalankan sekali di Supabase SQL Editor (project produksi) setelah 01-04.
-- Aman dijalankan ulang. Tidak menghapus data.
--
-- Isi:
--   A. Nomor WhatsApp tidak bisa lagi dibaca lewat tabel profiles (sebelumnya terbuka untuk siapa saja)
--   B. Ulasan hanya bisa dibuat lewat create_review, setelah transaksi selesai, untuk pihak lawan
--   C. Fungsi yang dipanggil aplikasi tapi belum ada: create_review, get_stats, get_public_profile


-- A. Sembunyikan kolom whatsapp ----------------------------------------------
-- Policy "profil bisa dibaca semua" tetap, tapi hak baca dibatasi per kolom.
-- Nomor WhatsApp hanya bisa diambil lewat get_contact (setelah booking disetujui)
-- dan get_my_profile (milik sendiri), keduanya security definer.
revoke select on public.profiles from anon, authenticated;
grant select (id, full_name, faculty, avatar_url, created_at) on public.profiles to anon, authenticated;


-- B. Ulasan hanya lewat RPC ---------------------------------------------------
drop policy if exists "tulis ulasan sendiri" on public.reviews;

alter table public.reviews add column if not exists created_at timestamptz default now();

create or replace function public.create_review(p_booking_id uuid, p_rating int, p_comment text default null)
returns public.reviews
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_uid uuid := auth.uid();
  v_b public.bookings%rowtype;
  v_owner uuid;
  v_reviewee uuid;
  v_review public.reviews%rowtype;
begin
  if v_uid is null then raise exception 'Silakan login dulu'; end if;
  if p_rating is null or p_rating < 1 or p_rating > 5 then
    raise exception 'Rating harus antara 1 sampai 5';
  end if;

  select * into v_b from public.bookings where id = p_booking_id;
  if not found then raise exception 'Booking tidak ditemukan'; end if;

  select owner_id into v_owner from public.items where id = v_b.item_id;
  if v_uid <> v_owner and v_uid <> v_b.borrower_id then
    raise exception 'Kamu tidak punya akses ke booking ini';
  end if;

  if v_b.status <> 'selesai' then
    raise exception 'Ulasan bisa diberikan setelah transaksi selesai';
  end if;

  if exists (select 1 from public.reviews r where r.booking_id = p_booking_id and r.reviewer_id = v_uid) then
    raise exception 'Kamu sudah memberi ulasan untuk transaksi ini';
  end if;

  v_reviewee := case when v_uid = v_owner then v_b.borrower_id else v_owner end;

  insert into public.reviews (booking_id, reviewer_id, reviewee_id, rating, comment)
  values (p_booking_id, v_uid, v_reviewee, p_rating, nullif(left(trim(coalesce(p_comment, '')), 500), ''))
  returning * into v_review;

  return v_review;
end;
$function$;


-- C. Statistik beranda: { total_items, completed_transactions, total_saved_community } ----
create or replace function public.get_stats()
returns jsonb
language sql
stable
security definer
set search_path to ''
as $function$
  select jsonb_build_object(
    'total_items', (select count(*) from public.items where status in ('tersedia', 'dipinjam')),
    'completed_transactions', (select count(*) from public.bookings where status = 'selesai'),
    'total_saved_community', (select coalesce(sum(saved_amount), 0) from public.bookings where status = 'selesai')
  )
$function$;


-- C. Profil publik: { profile, items, reviews } (tanpa nomor WhatsApp) -----------
create or replace function public.get_public_profile(p_user_id uuid)
returns jsonb
language sql
stable
security definer
set search_path to ''
as $function$
  select case when p.id is null then jsonb_build_object('profile', null) else jsonb_build_object(
    'profile', jsonb_build_object(
      'id', p.id,
      'full_name', p.full_name,
      'faculty', p.faculty,
      'avatar_url', p.avatar_url,
      'rating_avg', (select round(avg(r.rating)::numeric, 1) from public.reviews r where r.reviewee_id = p.id),
      'review_count', (select count(*) from public.reviews r where r.reviewee_id = p.id)
    ),
    'items', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', i.id, 'title', i.title, 'category', i.category, 'listing_type', i.listing_type,
        'retail_price', i.retail_price, 'rent_price_per_day', i.rent_price_per_day,
        'sale_price', i.sale_price, 'deposit', i.deposit, 'condition', i.condition,
        'location', i.location, 'photos', i.photos, 'status', i.status, 'created_at', i.created_at,
        'owner', jsonb_build_object('id', p.id, 'full_name', p.full_name, 'faculty', p.faculty)
      ) order by i.created_at desc)
      from public.items i
      where i.owner_id = p.id and i.status <> 'nonaktif'
    ), '[]'::jsonb),
    'reviews', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', r.id, 'rating', r.rating, 'comment', r.comment, 'created_at', r.created_at,
        'reviewer', jsonb_build_object('id', rv.id, 'full_name', rv.full_name)
      ) order by r.created_at desc nulls last)
      from public.reviews r
      join public.profiles rv on rv.id = r.reviewer_id
      where r.reviewee_id = p.id
    ), '[]'::jsonb)
  ) end
  from (select 1) dummy
  left join public.profiles p on p.id = p_user_id
$function$;


-- Cek cepat setelah dijalankan (hasilnya harus error "permission denied" untuk peran anon):
--   set role anon; select whatsapp from public.profiles limit 1; reset role;
