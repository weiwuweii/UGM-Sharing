-- 1. Index untuk tabel items
CREATE INDEX IF NOT EXISTS idx_items_category ON public.items (category);
CREATE INDEX IF NOT EXISTS idx_items_status ON public.items (status);
CREATE INDEX IF NOT EXISTS idx_items_owner_id ON public.items (owner_id);
CREATE INDEX IF NOT EXISTS idx_items_created_at ON public.items (created_at DESC);

-- 2. Index untuk tabel bookings (ganti borrower_id jika nama kolomnya berbeda)
CREATE INDEX IF NOT EXISTS idx_bookings_item_id ON public.bookings (item_id);
CREATE INDEX IF NOT EXISTS idx_bookings_borrower_id ON public.bookings (borrower_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings (status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON public.bookings (item_id, start_date, end_date);

-- Index optimasi pencarian & jadwal
CREATE INDEX IF NOT EXISTS idx_items_category ON public.items (category);
CREATE INDEX IF NOT EXISTS idx_items_status ON public.items (status);
CREATE INDEX IF NOT EXISTS idx_items_owner_id ON public.items (owner_id);
CREATE INDEX IF NOT EXISTS idx_items_created_at ON public.items (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_bookings_item_id ON public.bookings (item_id);
CREATE INDEX IF NOT EXISTS idx_bookings_borrower_id ON public.bookings (borrower_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings (status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON public.bookings (item_id, start_date, end_date);