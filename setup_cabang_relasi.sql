-- ============================================================
-- SIREGI - Setup Master Cabang & Relasi Database
-- Jalankan script ini di Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Buat Tabel Master Cabang
CREATE TABLE IF NOT EXISTS cabang (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama_cabang TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hapus data cabang yang lama jika ingin di-reset (opsional)
-- TRUNCATE TABLE cabang CASCADE;

-- Masukkan 20 Master Cabang Regional
INSERT INTO cabang (nama_cabang)
VALUES 
  ('BANTUL'),
  ('KULONPROGO'),
  ('GONDANG'),
  ('GEMOLONG'),
  ('JATINOM'),
  ('PEDAN'),
  ('KARANGANYAR'),
  ('AMPEL'),
  ('GRABAG'),
  ('BOROBUDUR'),
  ('AMBARAWA'),
  ('BATURETNO'),
  ('PACITAN'),
  ('WONOSARI'),
  ('PURWANTORO'),
  ('SUKOHARJO'),
  ('SLEMAN'),
  ('KARTASURA'),
  ('BANDONGAN'),
  ('KARANGGEDE')
ON CONFLICT (nama_cabang) DO NOTHING;

-- ============================================================
-- 2. Menambahkan Relasi ke Tabel Users
-- ============================================================
-- Menambah kolom cabang_id ke app_users
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='app_users' AND column_name='cabang_id') THEN
        ALTER TABLE app_users ADD COLUMN cabang_id UUID REFERENCES cabang(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Update contoh data user agar memiliki cabang_id (Opsional / Contoh)
-- Mengaitkan User Budi Santoso ke Cabang BANTUL
UPDATE app_users 
SET cabang_id = (SELECT id FROM cabang WHERE nama_cabang = 'BANTUL') 
WHERE username = 'user02';

-- ============================================================
-- 3. Menambahkan Relasi ke Tabel Kunjungan Cabang
-- ============================================================
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='kunjungan_cabang' AND column_name='cabang_id') THEN
        ALTER TABLE kunjungan_cabang ADD COLUMN cabang_id UUID REFERENCES cabang(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Agar constraint unique_cabang_tanggal lebih presisi menggunakan ID,
-- namun kita biarkan nama_cabang dan tambahkan unique terhadap cabang_id & tanggal
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'unique_cabang_id_tanggal'
  ) THEN
    ALTER TABLE kunjungan_cabang
      ADD CONSTRAINT unique_cabang_id_tanggal UNIQUE (cabang_id, tanggal_kunjungan);
  END IF;
END $$;

-- ============================================================
-- 4. RLS (Row Level Security) - Opsional Jika Difilter dari Frontend
-- Karena filtering role sudah dilakukan dari sisi Frontend React (berdasarkan session),
-- RLS kita set "True" agar aplikasi tetap bisa beroperasi normal tanpa custom token auth.
-- ============================================================
ALTER TABLE cabang ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read cabang" ON cabang;
CREATE POLICY "Public can read cabang" ON cabang FOR SELECT USING (true);
