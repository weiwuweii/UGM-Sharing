-- 03. Fungsi RPC dan trigger.
-- Disalin dari project Supabase produksi (12 Nov 2026) dengan supabase/tools/ekspor_dari_supabase.sql.
-- Fungsi rls_auto_enable tidak disertakan karena dibuat otomatis oleh Supabase.
-- Fungsi get_stats, get_public_profile, dan create_review ada di 05_perbaikan_keamanan.sql.

-- check_ugm_email
CREATE OR REPLACE FUNCTION public.check_ugm_email()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  if lower(new.email) not like '%@mail.ugm.ac.id'
     and lower(new.email) not like '%@ugm.ac.id' then
    raise exception 'Gunakan email UGM (@mail.ugm.ac.id atau @ugm.ac.id)';
  end if;
  return new;
end;
$function$
;

-- create_booking
CREATE OR REPLACE FUNCTION public.create_booking(p_item_id uuid, p_type text, p_start date, p_end date, p_note text DEFAULT NULL::text)
 RETURNS bookings
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_uid uuid := auth.uid();
  v_item public.items%rowtype;
  v_today date := (now() at time zone 'Asia/Jakarta')::date;
  v_days int;
  v_saved int := 0;
  v_booking public.bookings%rowtype;
begin
  if v_uid is null then
    raise exception 'Silakan login dulu';
  end if;

  if p_type not in ('pinjam', 'beli') then
    raise exception 'Jenis request tidak valid';
  end if;

  -- Kunci baris barang supaya dua request bersamaan tidak bisa lolos bareng
  select * into v_item from public.items where id = p_item_id for update;
  if not found then
    raise exception 'Barang tidak ditemukan';
  end if;

  if v_item.owner_id = v_uid then
    raise exception 'Tidak bisa memesan barang sendiri';
  end if;

  if v_item.status <> 'tersedia' then
    raise exception 'Barang sedang tidak tersedia';
  end if;

  if p_type = 'pinjam' then
    if v_item.listing_type = 'jual' or v_item.rent_price_per_day is null then
      raise exception 'Barang ini tidak untuk dipinjamkan';
    end if;
    if p_start is null or p_end is null then
      raise exception 'Tanggal pinjam wajib diisi';
    end if;
    if p_start < v_today then
      raise exception 'Tanggal mulai tidak boleh di masa lalu';
    end if;
    if p_end < p_start then
      raise exception 'Tanggal selesai harus sama atau setelah tanggal mulai';
    end if;

    v_days := (p_end - p_start) + 1;
    if v_days > 30 then
      raise exception 'Maksimal peminjaman 30 hari';
    end if;

    if exists (
      select 1 from public.bookings b
      where b.item_id = p_item_id
        and b.type = 'pinjam'
        and b.status = 'disetujui'
        and b.start_date <= p_end
        and b.end_date >= p_start
    ) then
      raise exception 'Tanggal sudah dipakai orang lain';
    end if;

    if exists (
      select 1 from public.bookings b
      where b.item_id = p_item_id
        and b.borrower_id = v_uid
        and b.type = 'pinjam'
        and b.status in ('pending', 'disetujui')
        and b.start_date <= p_end
        and b.end_date >= p_start
    ) then
      raise exception 'Kamu sudah mengirim request untuk tanggal ini';
    end if;

    v_saved := greatest(coalesce(v_item.retail_price, 0) - v_item.rent_price_per_day * v_days, 0);

  else -- beli
    if v_item.listing_type = 'pinjam' or v_item.sale_price is null then
      raise exception 'Barang ini tidak dijual';
    end if;

    if exists (
      select 1 from public.bookings b
      where b.item_id = p_item_id
        and b.borrower_id = v_uid
        and b.type = 'beli'
        and b.status in ('pending', 'disetujui')
    ) then
      raise exception 'Kamu sudah mengirim request beli untuk barang ini';
    end if;

    v_saved := greatest(coalesce(v_item.retail_price, 0) - v_item.sale_price, 0);
    p_start := null;
    p_end := null;
  end if;

  insert into public.bookings (item_id, borrower_id, type, start_date, end_date, note, saved_amount, status)
  values (p_item_id, v_uid, p_type, p_start, p_end, nullif(trim(coalesce(p_note, '')), ''), v_saved, 'pending')
  returning * into v_booking;

  return v_booking;
end;
$function$
;

-- get_booked_ranges
CREATE OR REPLACE FUNCTION public.get_booked_ranges(p_item_id uuid)
 RETURNS TABLE(start_date date, end_date date)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select b.start_date, b.end_date
  from public.bookings b
  where b.item_id = p_item_id
    and b.type = 'pinjam'
    and b.status = 'disetujui'
    and b.end_date >= current_date
$function$
;

-- get_contact
CREATE OR REPLACE FUNCTION public.get_contact(p_booking_id uuid)
 RETURNS TABLE(full_name text, whatsapp text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_uid uuid := auth.uid();
  v_b public.bookings%rowtype;
  v_owner uuid;
  v_other uuid;
begin
  if v_uid is null then raise exception 'Silakan login dulu'; end if;

  select * into v_b from public.bookings where id = p_booking_id;
  if not found then raise exception 'Booking tidak ditemukan'; end if;

  select owner_id into v_owner from public.items where id = v_b.item_id;
  if v_uid <> v_owner and v_uid <> v_b.borrower_id then
    raise exception 'Kamu tidak punya akses ke booking ini';
  end if;

  if v_b.status not in ('disetujui', 'selesai') then
    raise exception 'Kontak baru tersedia setelah request disetujui';
  end if;

  v_other := case when v_uid = v_owner then v_b.borrower_id else v_owner end;
  return query select p.full_name, p.whatsapp from public.profiles p where p.id = v_other;
end;
$function$
;

-- get_my_dashboard
CREATE OR REPLACE FUNCTION public.get_my_dashboard()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_uid uuid := auth.uid();
  result jsonb;
begin
  if v_uid is null then raise exception 'Silakan login dulu'; end if;

  select jsonb_build_object(
    'my_items', coalesce((
      select jsonb_agg(to_jsonb(i) order by i.created_at desc)
      from public.items i where i.owner_id = v_uid
    ), '[]'::jsonb),

    'incoming_requests', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', b.id, 'type', b.type, 'start_date', b.start_date, 'end_date', b.end_date,
        'note', b.note, 'status', b.status, 'saved_amount', b.saved_amount, 'created_at', b.created_at,
        'item', jsonb_build_object('id', i.id, 'title', i.title, 'photo', i.photos[1]),
        'borrower', jsonb_build_object('id', p.id, 'full_name', p.full_name, 'faculty', p.faculty)
      ) order by b.created_at desc)
      from public.bookings b
      join public.items i on i.id = b.item_id
      join public.profiles p on p.id = b.borrower_id
      where i.owner_id = v_uid and b.status in ('pending', 'disetujui')
    ), '[]'::jsonb),

    'my_requests', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', b.id, 'type', b.type, 'start_date', b.start_date, 'end_date', b.end_date,
        'note', b.note, 'status', b.status, 'saved_amount', b.saved_amount, 'created_at', b.created_at,
        'item', jsonb_build_object('id', i.id, 'title', i.title, 'photo', i.photos[1]),
        'owner', jsonb_build_object('id', po.id, 'full_name', po.full_name, 'faculty', po.faculty)
      ) order by b.created_at desc)
      from public.bookings b
      join public.items i on i.id = b.item_id
      join public.profiles po on po.id = i.owner_id
      where b.borrower_id = v_uid and b.status in ('pending', 'disetujui')
    ), '[]'::jsonb),

    'history', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', b.id, 'type', b.type, 'start_date', b.start_date, 'end_date', b.end_date,
        'status', b.status, 'saved_amount', b.saved_amount, 'created_at', b.created_at,
        'role', case when i.owner_id = v_uid then 'pemilik' else 'peminjam' end,
        'item', jsonb_build_object('id', i.id, 'title', i.title, 'photo', i.photos[1]),
        'borrower', jsonb_build_object('id', pb.id, 'full_name', pb.full_name),
        'owner', jsonb_build_object('id', po.id, 'full_name', po.full_name)
      ) order by b.created_at desc)
      from public.bookings b
      join public.items i on i.id = b.item_id
      join public.profiles pb on pb.id = b.borrower_id
      join public.profiles po on po.id = i.owner_id
      where (i.owner_id = v_uid or b.borrower_id = v_uid)
        and b.status in ('selesai', 'ditolak', 'dibatalkan')
    ), '[]'::jsonb),

    'total_saved', coalesce((
      select sum(b.saved_amount) from public.bookings b
      where b.borrower_id = v_uid and b.status = 'selesai'
    ), 0),

    'total_income', coalesce((
      select sum(case when b.type = 'pinjam'
                      then coalesce(i.rent_price_per_day, 0) * ((b.end_date - b.start_date) + 1)
                      else coalesce(i.sale_price, 0) end)
      from public.bookings b
      join public.items i on i.id = b.item_id
      where i.owner_id = v_uid and b.status = 'selesai'
    ), 0)
  ) into result;

  return result;
end;
$function$
;

-- get_my_profile
CREATE OR REPLACE FUNCTION public.get_my_profile()
 RETURNS TABLE(id uuid, full_name text, faculty text, avatar_url text, whatsapp text)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select p.id, p.full_name, p.faculty, p.avatar_url, p.whatsapp
  from public.profiles p
  where p.id = auth.uid()
$function$
;

-- handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$function$
;

-- update_booking_status
CREATE OR REPLACE FUNCTION public.update_booking_status(p_booking_id uuid, p_status text)
 RETURNS bookings
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_uid uuid := auth.uid();
  v_b public.bookings%rowtype;
  v_item public.items%rowtype;
  v_is_owner boolean;
  v_is_borrower boolean;
begin
  if v_uid is null then raise exception 'Silakan login dulu'; end if;
  if p_status not in ('disetujui', 'ditolak', 'selesai', 'dibatalkan') then
    raise exception 'Status tidak valid';
  end if;

  select * into v_b from public.bookings where id = p_booking_id for update;
  if not found then raise exception 'Booking tidak ditemukan'; end if;

  select * into v_item from public.items where id = v_b.item_id for update;
  v_is_owner := (v_item.owner_id = v_uid);
  v_is_borrower := (v_b.borrower_id = v_uid);

  if not v_is_owner and not v_is_borrower then
    raise exception 'Kamu tidak punya akses ke booking ini';
  end if;

  if p_status in ('disetujui', 'ditolak') then
    if not v_is_owner then raise exception 'Hanya pemilik barang yang bisa menyetujui atau menolak'; end if;
    if v_b.status <> 'pending' then raise exception 'Request ini sudah diproses'; end if;
  elsif p_status = 'selesai' then
    if not v_is_owner then raise exception 'Hanya pemilik barang yang bisa menandai selesai'; end if;
    if v_b.status <> 'disetujui' then raise exception 'Hanya request yang sudah disetujui yang bisa diselesaikan'; end if;
  elsif p_status = 'dibatalkan' then
    if not v_is_borrower then raise exception 'Hanya peminjam yang bisa membatalkan'; end if;
    if v_b.status not in ('pending', 'disetujui') then raise exception 'Request ini tidak bisa dibatalkan'; end if;
  end if;

  if p_status = 'disetujui' then
    if v_b.type = 'pinjam' then
      if exists (
        select 1 from public.bookings o
        where o.item_id = v_b.item_id and o.id <> v_b.id
          and o.type = 'pinjam' and o.status = 'disetujui'
          and o.start_date <= v_b.end_date and o.end_date >= v_b.start_date
      ) then
        raise exception 'Tanggal sudah dipakai booking lain yang disetujui';
      end if;
    else
      if v_item.status <> 'tersedia' then raise exception 'Barang sudah tidak tersedia'; end if;
      update public.items set status = 'terjual' where id = v_item.id;
    end if;
  end if;

  if p_status = 'dibatalkan' and v_b.type = 'beli' and v_b.status = 'disetujui' then
    update public.items set status = 'tersedia' where id = v_item.id and status = 'terjual';
  end if;

  update public.bookings set status = p_status where id = v_b.id returning * into v_b;
  return v_b;
end;
$function$
;

-- Trigger di auth.users: validasi email UGM dan pembuatan profil otomatis
drop trigger if exists enforce_ugm_email on auth.users;
CREATE TRIGGER enforce_ugm_email BEFORE INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.check_ugm_email();
drop trigger if exists on_auth_user_created on auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
