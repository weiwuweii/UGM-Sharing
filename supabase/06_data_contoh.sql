-- 06. Data contoh: 40 barang dengan gambar yang sesuai.
-- Jalankan di Supabase SQL Editor SETELAH minimal 1 akun demo mendaftar lewat halaman Masuk/Daftar.
-- Barang dibagi rata ke semua akun yang ada (urut tanggal daftar).
-- Aman dijalankan ulang: barang dengan judul yang sudah ada tidak ditambahkan lagi.
-- Gambar ada di folder public/barang/ (ilustrasi SVG, ikut ter-deploy bersama website).

with pemilik as (
  select p.id, (row_number() over (order by p.created_at) - 1)::int as n
  from public.profiles p
  join auth.users u on u.id = p.id
  where u.email <> 'demo.peminjam@mail.ugm.ac.id'
), jumlah as (
  select count(*)::int as c from pemilik
), data (idx, title, description, category, listing_type, retail_price, rent_price_per_day, sale_price, deposit, condition, location, foto, status) as (
  values
  (0, 'Kalkulator Ilmiah Casio fx-991ID Plus', 'Lengkap dengan cover. Cocok untuk UTS Kalkulus dan Fisika Dasar.', 'kalkulator', 'pinjam', 265000, 8000, null, 50000, 'baik', 'FMIPA', '/barang/kalkulator-ilmiah.svg', 'tersedia'),
  (1, 'Kalkulator Casio fx-570ES Plus', 'Tombol masih empuk, baterai baru diganti. Ada goresan halus di layar.', 'kalkulator', 'keduanya', 210000, 7000, 120000, 30000, 'layak_pakai', 'Teknik', '/barang/kalkulator-ilmiah.svg', 'tersedia'),
  (2, 'Kalkulator Grafik Casio fx-9860GIII', 'Untuk praktikum Metode Numerik dan Statistika. Bonus kabel USB.', 'kalkulator', 'pinjam', 1650000, 25000, null, 300000, 'seperti_baru', 'Teknik', '/barang/kalkulator-grafik.svg', 'tersedia'),
  (3, 'Kalkulator Ilmiah Casio fx-350MS', 'Sudah tidak dipakai setelah lulus Matematika Dasar.', 'kalkulator', 'jual', 150000, null, 70000, 0, 'baik', 'Bulaksumur', '/barang/kalkulator-ilmiah.svg', 'tersedia'),
  (4, 'Kalkulator Keuangan Casio FC-200V', 'Untuk Manajemen Keuangan dan Akuntansi. Fungsi NPV, IRR, amortisasi.', 'kalkulator', 'pinjam', 780000, 15000, null, 150000, 'baik', 'FEB', '/barang/kalkulator-ilmiah.svg', 'tersedia'),
  (5, 'Kalkulator Ilmiah Casio fx-991EX Classwiz', 'Layar resolusi tinggi, bisa hitung matriks dan integral.', 'kalkulator', 'keduanya', 330000, 10000, 200000, 50000, 'seperti_baru', 'Sekip', '/barang/kalkulator-ilmiah.svg', 'dipinjam'),
  (6, 'Kamera Mirrorless Sony A6000 + Kit 16-50mm', 'Dua baterai, charger, dan memori 64 GB. Cocok untuk dokumentasi acara.', 'kamera', 'pinjam', 6500000, 120000, null, 1000000, 'baik', 'Teknik', '/barang/kamera-mirrorless.svg', 'tersedia'),
  (7, 'Kamera DSLR Canon EOS 1300D', 'Shutter count rendah. Termasuk tas kamera dan strap.', 'kamera', 'keduanya', 5200000, 90000, 2800000, 750000, 'baik', 'Bulaksumur', '/barang/kamera-dslr.svg', 'tersedia'),
  (8, 'Kamera Mirrorless Fujifilm X-A3', 'Warna khas Fuji, enak untuk konten Instagram organisasi.', 'kamera', 'pinjam', 5500000, 100000, null, 800000, 'seperti_baru', 'FEB', '/barang/kamera-mirrorless.svg', 'tersedia'),
  (9, 'Kamera Instan Fujifilm Instax Mini 11', 'Film tidak termasuk. Pas untuk wisuda atau makrab.', 'kamera', 'pinjam', 1100000, 35000, null, 200000, 'baik', 'Bulaksumur', '/barang/kamera-polaroid.svg', 'tersedia'),
  (10, 'Lensa Canon EF 50mm f/1.8 STM', 'Lensa fix untuk foto wisuda dan portrait. Mount EF.', 'kamera', 'pinjam', 2100000, 40000, null, 400000, 'seperti_baru', 'Teknik', '/barang/lensa.svg', 'tersedia'),
  (11, 'Tripod Takara ECO-196A', 'Tinggi maksimal 150 cm, ada holder HP.', 'kamera', 'keduanya', 280000, 10000, 150000, 50000, 'baik', 'FMIPA', '/barang/tripod.svg', 'tersedia'),
  (12, 'Tripod Aluminium Excell Promos', 'Kaki agak seret tapi masih kokoh.', 'kamera', 'pinjam', 350000, 12000, null, 50000, 'layak_pakai', 'Sekip', '/barang/tripod.svg', 'tersedia'),
  (13, 'Charger Laptop Lenovo 65W USB-C', 'Kompatibel dengan ThinkPad dan IdeaPad USB-C.', 'charger', 'pinjam', 350000, 8000, null, 50000, 'baik', 'Teknik', '/barang/charger-laptop.svg', 'tersedia'),
  (14, 'Charger Laptop ASUS 19V 3.42A', 'Untuk ASUS VivoBook dan X-series, colokan bulat.', 'charger', 'keduanya', 250000, 7000, 120000, 50000, 'baik', 'FMIPA', '/barang/charger-laptop.svg', 'tersedia'),
  (15, 'Charger MacBook 61W USB-C', 'Original Apple, kabel USB-C 2 m.', 'charger', 'pinjam', 1300000, 20000, null, 250000, 'seperti_baru', 'FEB', '/barang/charger-laptop.svg', 'tersedia'),
  (16, 'Charger HP Samsung 25W Super Fast', 'Kepala charger saja, kabel tidak termasuk.', 'charger', 'jual', 250000, null, 110000, 0, 'baik', 'Bulaksumur', '/barang/charger-hp.svg', 'tersedia'),
  (17, 'Powerbank Anker 20000 mAh', 'Bisa dua perangkat sekaligus. Cocok untuk KKN atau lomba.', 'charger', 'pinjam', 500000, 10000, null, 100000, 'baik', 'Perpustakaan Pusat', '/barang/powerbank.svg', 'tersedia'),
  (18, 'Powerbank Xiaomi 10000 mAh', 'Ada lecet di body, kapasitas masih bagus.', 'charger', 'keduanya', 200000, 5000, 100000, 30000, 'layak_pakai', 'Sekip', '/barang/powerbank.svg', 'tersedia'),
  (19, 'Jas Lab Lengan Panjang ukuran M', 'Sudah dicuci bersih, ada nama yang sudah dilepas.', 'jas lab', 'pinjam', 120000, 5000, null, 30000, 'baik', 'FMIPA', '/barang/jas-lab.svg', 'tersedia'),
  (20, 'Jas Lab ukuran L', 'Untuk praktikum Biokimia dan Farmakologi.', 'jas lab', 'keduanya', 130000, 5000, 60000, 30000, 'baik', 'Sekip', '/barang/jas-lab.svg', 'tersedia'),
  (21, 'Jas Lab ukuran S', 'Ada noda kecil di lengan, sudah tidak dipakai.', 'jas lab', 'jual', 110000, null, 50000, 0, 'layak_pakai', 'Teknik', '/barang/jas-lab.svg', 'tersedia'),
  (22, 'Kacamata Safety Lab (Goggles)', 'Wajib untuk praktikum Kimia Dasar.', 'jas lab', 'pinjam', 60000, 3000, null, 10000, 'seperti_baru', 'FMIPA', '/barang/kacamata-lab.svg', 'tersedia'),
  (23, 'Stetoskop Littmann Classic III', 'Untuk skill lab. Earpiece sudah diganti baru.', 'alat kuliah', 'pinjam', 2300000, 30000, null, 500000, 'baik', 'Sekip', '/barang/stetoskop.svg', 'tersedia'),
  (24, 'Set Alat Gambar Teknik (penggaris, segitiga, jangka)', 'Lengkap untuk Menggambar Teknik semester 1.', 'alat kuliah', 'keduanya', 180000, 6000, 90000, 30000, 'baik', 'Teknik', '/barang/alat-gambar.svg', 'tersedia'),
  (25, 'Papan Gambar A3 + Penggaris T', 'Permukaan masih rata, ada bekas selotip.', 'alat kuliah', 'pinjam', 250000, 7000, null, 50000, 'layak_pakai', 'Teknik', '/barang/papan-gambar.svg', 'tersedia'),
  (26, 'Buku Kalkulus Purcell Jilid 1', 'Edisi 9 terjemahan, beberapa halaman ada stabilo.', 'buku', 'keduanya', 150000, 4000, 80000, 30000, 'baik', 'FMIPA', '/barang/buku-teks.svg', 'tersedia'),
  (27, 'Buku Fisika Dasar Halliday', 'Edisi 10, lengkap dengan kunci jawaban ganjil.', 'buku', 'pinjam', 250000, 5000, null, 50000, 'baik', 'Teknik', '/barang/buku-teks.svg', 'tersedia'),
  (28, 'Buku Pengantar Ilmu Ekonomi Mankiw', 'Hampir tidak pernah dibuka, masih wangi toko.', 'buku', 'jual', 180000, null, 90000, 0, 'seperti_baru', 'FEB', '/barang/buku-teks.svg', 'tersedia'),
  (29, 'Paket Buku Anatomi Sobotta 3 Jilid', 'Untuk blok anatomi, jilid 1 sampai 3.', 'buku', 'pinjam', 1200000, 20000, null, 300000, 'baik', 'Sekip', '/barang/buku-tumpuk.svg', 'tersedia'),
  (30, 'Buku Persiapan TOEFL ITP Barron''s', 'Ada coretan latihan dengan pensil, bisa dihapus.', 'buku', 'keduanya', 200000, 4000, 100000, 30000, 'layak_pakai', 'Perpustakaan Pusat', '/barang/buku-tumpuk.svg', 'tersedia'),
  (31, 'Proyektor Mini Epson EB-E01', 'Untuk nobar, presentasi, atau acara himpunan. Termasuk kabel HDMI.', 'elektronik', 'pinjam', 5000000, 75000, null, 800000, 'baik', 'Bulaksumur', '/barang/proyektor.svg', 'tersedia'),
  (32, 'Proyektor Portabel Mini LED', 'Terang di ruangan gelap, cocok untuk kos.', 'elektronik', 'keduanya', 900000, 30000, 500000, 200000, 'layak_pakai', 'FEB', '/barang/proyektor.svg', 'tersedia'),
  (33, 'Speaker Bluetooth JBL Flip 5', 'Suara keras dan tahan cipratan air. Cocok untuk acara outdoor.', 'elektronik', 'pinjam', 1500000, 30000, null, 300000, 'baik', 'Bulaksumur', '/barang/speaker.svg', 'tersedia'),
  (34, 'Headphone Sony WH-CH520', 'Baterai tahan sampai 50 jam.', 'elektronik', 'keduanya', 700000, 15000, 400000, 150000, 'seperti_baru', 'FMIPA', '/barang/headphone.svg', 'tersedia'),
  (35, 'Mikrofon USB Fifine K669B', 'Untuk rekam podcast, voice over tugas, atau rapat online.', 'elektronik', 'pinjam', 450000, 15000, null, 100000, 'baik', 'Teknik', '/barang/mikrofon.svg', 'tersedia'),
  (36, 'Adapter USB-C ke HDMI dan USB 3.0', 'Sambungkan laptop ke proyektor kelas.', 'elektronik', 'pinjam', 180000, 5000, null, 30000, 'baik', 'Perpustakaan Pusat', '/barang/adapter-hdmi.svg', 'tersedia'),
  (37, 'Laptop ASUS VivoBook 14 (Core i5)', 'RAM 8 GB, sudah terpasang Office dan Python. Untuk ujian atau lomba.', 'elektronik', 'pinjam', 8500000, 100000, null, 1500000, 'baik', 'FMIPA', '/barang/laptop.svg', 'tersedia'),
  (38, 'Kabel HDMI 3 Meter', 'Masih berfungsi normal, sisa acara.', 'elektronik', 'jual', 60000, null, 30000, 0, 'baik', 'Bulaksumur', '/barang/adapter-hdmi.svg', 'terjual'),
  (39, 'Laptop Lenovo IdeaPad Slim 3', 'Baterai tahan sekitar 3 jam. Ada stiker yang bisa dilepas.', 'elektronik', 'keduanya', 7000000, 80000, 4500000, 1200000, 'layak_pakai', 'Sekip', '/barang/laptop.svg', 'tersedia')
)
insert into public.items
  (owner_id, title, description, category, listing_type, retail_price, rent_price_per_day, sale_price, deposit, condition, location, photos, status, created_at)
select p.id, d.title, d.description, d.category, d.listing_type, d.retail_price, d.rent_price_per_day, d.sale_price, d.deposit,
       d.condition, d.location, array[d.foto], d.status, now() - make_interval(hours => ((d.idx * 13) % 40) * 5)
from data d
join pemilik p on p.n = d.idx % (select c from jumlah)
where not exists (select 1 from public.items i where i.title = d.title);

-- Cek hasil: harus muncul jumlah barang per kategori
select category, count(*) from public.items group by category order by category;

-- ---------------------------------------------------------------------------
-- OPSIONAL: rapikan barang lama yang gambarnya tidak cocok.
-- Hanya menyentuh barang yang fotonya BUKAN unggahan asli dan bukan dari data contoh di atas.
-- Jalankan bagian "Lihat dulu", periksa hasilnya, baru hapus tanda -- pada bagian "Ubah".
-- ---------------------------------------------------------------------------

-- Lihat dulu: barang lama beserta gambar barunya
select id, title, category, photos,
  case
    when title ilike '%grafik%' then '/barang/kalkulator-grafik.svg'
    when title ilike '%kalkulator%' then '/barang/kalkulator-ilmiah.svg'
    when title ilike '%tripod%' then '/barang/tripod.svg'
    when title ilike '%lensa%' then '/barang/lensa.svg'
    when title ilike '%instax%' or title ilike '%polaroid%' then '/barang/kamera-polaroid.svg'
    when title ilike '%dslr%' or title ilike '%canon%' or title ilike '%nikon%' then '/barang/kamera-dslr.svg'
    when title ilike '%kamera%' then '/barang/kamera-mirrorless.svg'
    when title ilike '%powerbank%' or title ilike '%power bank%' then '/barang/powerbank.svg'
    when title ilike '%charger%laptop%' or title ilike '%charger%macbook%' or title ilike '%adaptor laptop%' then '/barang/charger-laptop.svg'
    when title ilike '%charger%' then '/barang/charger-hp.svg'
    when title ilike '%jas%lab%' then '/barang/jas-lab.svg'
    when title ilike '%goggle%' or title ilike '%kacamata%' then '/barang/kacamata-lab.svg'
    when title ilike '%proyektor%' or title ilike '%projector%' then '/barang/proyektor.svg'
    when title ilike '%speaker%' then '/barang/speaker.svg'
    when title ilike '%headphone%' or title ilike '%headset%' then '/barang/headphone.svg'
    when title ilike '%mic%' or title ilike '%mikrofon%' then '/barang/mikrofon.svg'
    when title ilike '%hdmi%' or title ilike '%adapter%' or title ilike '%kabel%' then '/barang/adapter-hdmi.svg'
    when title ilike '%laptop%' then '/barang/laptop.svg'
    when title ilike '%buku%' then '/barang/buku-teks.svg'
    when title ilike '%stetoskop%' then '/barang/stetoskop.svg'
    when title ilike '%gambar%' or title ilike '%penggaris%' or title ilike '%jangka%' then '/barang/alat-gambar.svg'
  end as gambar_baru
from public.items
where not exists (select 1 from unnest(photos) f where f like '%/item-photos/%' or f like '/barang/%');

-- Ubah (hapus tanda -- di 3 baris di bawah, lalu Run). Barang yang tidak cocok kata kuncinya tidak diubah.
-- update public.items i set photos = array[g.gambar_baru]
-- from (select id, case when title ilike '%grafik%' then '/barang/kalkulator-grafik.svg' when title ilike '%kalkulator%' then '/barang/kalkulator-ilmiah.svg' when title ilike '%tripod%' then '/barang/tripod.svg' when title ilike '%lensa%' then '/barang/lensa.svg' when title ilike '%instax%' or title ilike '%polaroid%' then '/barang/kamera-polaroid.svg' when title ilike '%dslr%' or title ilike '%canon%' or title ilike '%nikon%' then '/barang/kamera-dslr.svg' when title ilike '%kamera%' then '/barang/kamera-mirrorless.svg' when title ilike '%powerbank%' or title ilike '%power bank%' then '/barang/powerbank.svg' when title ilike '%charger%laptop%' or title ilike '%charger%macbook%' or title ilike '%adaptor laptop%' then '/barang/charger-laptop.svg' when title ilike '%charger%' then '/barang/charger-hp.svg' when title ilike '%jas%lab%' then '/barang/jas-lab.svg' when title ilike '%goggle%' or title ilike '%kacamata%' then '/barang/kacamata-lab.svg' when title ilike '%proyektor%' or title ilike '%projector%' then '/barang/proyektor.svg' when title ilike '%speaker%' then '/barang/speaker.svg' when title ilike '%headphone%' or title ilike '%headset%' then '/barang/headphone.svg' when title ilike '%mic%' or title ilike '%mikrofon%' then '/barang/mikrofon.svg' when title ilike '%hdmi%' or title ilike '%adapter%' or title ilike '%kabel%' then '/barang/adapter-hdmi.svg' when title ilike '%laptop%' then '/barang/laptop.svg' when title ilike '%buku%' then '/barang/buku-teks.svg' when title ilike '%stetoskop%' then '/barang/stetoskop.svg' when title ilike '%gambar%' or title ilike '%penggaris%' or title ilike '%jangka%' then '/barang/alat-gambar.svg' end as gambar_baru from public.items) g
-- where i.id = g.id and g.gambar_baru is not null and not exists (select 1 from unnest(i.photos) f where f like '%/item-photos/%' or f like '/barang/%');
