-- =============================================
-- MIGRASI: Tambah kolom tahun ke staff_progress
-- Jalankan di Supabase SQL Editor
-- =============================================

-- Tambah kolom tahun (default 2026 untuk data yang sudah ada)
ALTER TABLE staff_progress
ADD COLUMN IF NOT EXISTS tahun INTEGER DEFAULT 2026;

-- Set semua data lama menjadi tahun 2026
UPDATE staff_progress SET tahun = 2026 WHERE tahun IS NULL OR tahun = 0;
