-- =============================================
-- MONITORING: Tambah Tracking Waktu Update
-- Jalankan di Supabase SQL Editor
-- =============================================

-- 1. Tambah kolom updated_at jika belum ada
ALTER TABLE staff_progress 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Buat fungsi untuk auto-update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 3. Pasang trigger ke tabel staff_progress
DROP TRIGGER IF EXISTS update_staff_progress_modtime ON staff_progress;
CREATE TRIGGER update_staff_progress_modtime
    BEFORE UPDATE ON staff_progress
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
