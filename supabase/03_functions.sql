create table profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text not null,
  faculty text,
  avatar_url text,
  whatsapp text,
  created_at timestamptz default now()
);

create table items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  description text,
  category text not null,
  listing_type text not null check (listing_type in ('pinjam','jual','keduanya')),
  retail_price int,
  rent_price_per_day int,
  sale_price int,
  deposit int default 0,
  condition text check (condition in ('baru','seperti_baru','baik','layak_pakai')),
  location text not null,
  photos text[] default '{}',
  status text default 'tersedia' check (status in ('tersedia','dipinjam','terjual','nonaktif')),
  created_at timestamptz default now()
);

create table bookings (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references items(id) on delete cascade,
  borrower_id uuid not null references profiles(id),
  type text not null check (type in ('pinjam','beli')),
  start_date date,
  end_date date,
  note text,
  saved_amount int default 0,
  status text default 'pending' check (status in ('pending','disetujui','ditolak','selesai','dibatalkan')),
  created_at timestamptz default now()
);

create table reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  reviewer_id uuid not null references profiles(id),
  reviewee_id uuid not null references profiles(id),
  rating int not null check (rating between 1 and 5),
  comment text,
  unique (booking_id, reviewer_id)
);

create table wishlists (
  user_id uuid references profiles(id) on delete cascade,
  item_id uuid references items(id) on delete cascade,
  primary key (user_id, item_id)
);

create table reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references profiles(id),
  item_id uuid references items(id) on delete cascade,
  reason text not null,
  created_at timestamptz default now()
);