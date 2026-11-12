-- Jalankan di Supabase SQL Editor (project produksi). Hanya membaca, tidak mengubah apa pun.
-- Hasilnya adalah perintah SQL siap tempel untuk 03_functions.sql dan 04_rls_policies.sql.

-- 1) Semua fungsi di schema public -> tempel ke 03_functions.sql
select pg_get_functiondef(p.oid) || ';' as fungsi
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.prokind = 'f'
order by p.proname;

-- 2) Trigger (termasuk trigger di auth.users untuk membuat profil) -> tempel ke 03_functions.sql
select pg_get_triggerdef(t.oid) || ';' as trigger
from pg_trigger t
join pg_class c on c.oid = t.tgrelid
join pg_namespace n on n.oid = c.relnamespace
where not t.tgisinternal and n.nspname in ('public', 'auth')
  and (n.nspname = 'public' or c.relname = 'users');

-- 3) RLS: aktifkan di tiap tabel lalu buat ulang semua policy -> tempel ke 04_rls_policies.sql
select format('alter table %I.%I enable row level security;', schemaname, tablename) as rls
from pg_tables
where schemaname = 'public' and rowsecurity
union all
select format(
  'create policy %I on %I.%I as %s for %s to %s%s%s;',
  policyname, schemaname, tablename, permissive, cmd,
  array_to_string(roles, ', '),
  coalesce(' using (' || qual || ')', ''),
  coalesce(' with check (' || with_check || ')', '')
)
from pg_policies
where schemaname = 'public';
