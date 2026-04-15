-- SQL Migration untuk Reset dan Isi Data Historis SIREGI (Februari - April)
-- Jalankan ini di SQL Editor Supabase Anda

-- 1. Tambahkan kolom periode jika belum ada
ALTER TABLE staff_progress ADD COLUMN IF NOT EXISTS periode TEXT;

-- 2. Kosongkan data lama terlebih dahulu agar tidak ada nilai NULL
-- Mengingat Anda ingin mengisi ulang semuanya dari data Excel baru
TRUNCATE TABLE staff_progress;

-- 3. Baru atur kolom periode menjadi NOT NULL dan buat Primary Key (id, periode)
ALTER TABLE staff_progress ALTER COLUMN periode SET NOT NULL;
ALTER TABLE staff_progress DROP CONSTRAINT IF EXISTS staff_progress_pkey;
ALTER TABLE staff_progress ADD PRIMARY KEY (id, periode);

-- 3. Masukkan Data APRIL
INSERT INTO staff_progress (id, name, branch, periode, release_voucher, unapprove_pengajuan, recalculate_delinquency, transfer_pencairan, salah_generate, ppi_not_entry, validasi, tiket_perbaikan) VALUES
('022', 'Ermi Lanjar Budiyati', 'KULONPROGO', 'April', 0, 0, 0, 0, 0, 0, 0, 0),
('052', 'Heni Suryaningsih', 'GONDANG', 'April', 0, 0, 0, 0, 0, 0, 0, 0),
('081', 'Giga Mahera', 'PEDAN', 'April', 0, 0, 0, 0, 0, 0, 0, 0),
('132', 'Sigit Raharjo', 'AMBARAWA', 'April', 0, 0, 0, 0, 0, 0, 0, 0),
('160', 'Azza Avita Santi', 'WONOSARI', 'April', 0, 0, 0, 0, 0, 0, 0, 0),
('297', 'Muhamad Khasnan Khabib', 'KARANGGEDE', 'April', 0, 0, 0, 0, 0, 0, 0, 0),
('084', 'Pandu Huda Prasetya', 'KARANGANYAR', 'April', 0, 0, 0, 0, 0, 5, 0, 0),
('158', 'Sulastri', 'PACITAN', 'April', 0, 1, 0, 0, 0, 0, 0, 0),
('207', 'Febia Mita Ambarwati', 'SUKOHARJO', 'April', 0, 0, 0, 0, 0, 2, 0, 0),
('063', 'Winda Yaniasari', 'GEMOLONG', 'April', 0, 0, 2, 0, 0, 0, 0, 0),
('071', 'Yeni Suryani', 'JATINOM', 'April', 1, 0, 1, 0, 0, 0, 0, 0),
('124', 'Miftakhurrohman', 'BOROBUDUR', 'April', 0, 0, 0, 0, 0, 0, 8, 0),
('282', 'Meilina Rahmawati', 'KARTASURA', 'April', 0, 0, 2, 0, 0, 0, 0, 0),
('180', 'Alan Agil Warseno', 'PURWANTORO', 'April', 0, 1, 0, 0, 0, 0, 5, 0),
('296', 'Sandy Ibrahim', 'BANDONGAN', 'April', 0, 0, 0, 0, 0, 1, 7, 0),
('247', 'Wara Inggar Listyaningrum', 'SLEMAN', 'April', 0, 2, 0, 0, 0, 0, 2, 0),
('153', 'Fredi Nurahmad', 'BATURETNO', 'April', 0, 0, 0, 0, 0, 5, 8, 0),
('007', 'Nala Ratih Anjanida AlMahmudah', 'BANTUL', 'April', 0, 1, 0, 0, 0, 0, 17, 0),
('120', 'Ifan Baktiar', 'GRABAG', 'April', 0, 0, 0, 0, 0, 2, 24, 0),
('089', 'Desi Prahastiwi', 'AMPEL', 'April', 0, 1, 0, 0, 0, 0, 20, 1);

-- 4. Masukkan Data MARET
INSERT INTO staff_progress (id, name, branch, periode, release_voucher, unapprove_pengajuan, recalculate_delinquency, transfer_pencairan, salah_generate, ppi_not_entry, validasi, tiket_perbaikan) VALUES
('022', 'Ermi Lanjar Budiyati', 'KULONPROGO', 'Maret', 0, 0, 0, 0, 0, 0, 0, 0),
('081', 'Giga Mahera', 'PEDAN', 'Maret', 0, 0, 0, 0, 0, 0, 0, 0),
('052', 'Heni Suryaningsih', 'GONDANG', 'Maret', 0, 1, 0, 0, 0, 0, 0, 0),
('084', 'Pandu Huda Prasetya', 'KARANGANYAR', 'Maret', 0, 0, 0, 0, 0, 5, 0, 0),
('207', 'Febia Mita Ambarwati', 'SUKOHARJO', 'Maret', 0, 0, 0, 0, 0, 2, 0, 0),
('071', 'Yeni Suryani', 'JATINOM', 'Maret', 0, 0, 1, 0, 0, 0, 0, 0),
('158', 'Sulastri', 'PACITAN', 'Maret', 0, 0, 1, 0, 0, 0, 0, 0),
('180', 'Alan Agil Warseno', 'PURWANTORO', 'Maret', 0, 0, 0, 0, 0, 0, 5, 0),
('282', 'Meilina Rahmawati', 'KARTASURA', 'Maret', 0, 0, 0, 1, 0, 0, 0, 0),
('124', 'Miftakhurrohman', 'BOROBUDUR', 'Maret', 0, 0, 0, 0, 0, 0, 8, 0),
('132', 'Sigit Raharjo', 'AMBARAWA', 'Maret', 0, 0, 3, 0, 0, 0, 0, 0),
('297', 'Muhamad Khasnan Khabib', 'KARANGGEDE', 'Maret', 1, 0, 1, 0, 0, 0, 0, 0),
('160', 'Azza Avita Santi', 'WONOSARI', 'Maret', 0, 1, 0, 1, 0, 0, 0, 0),
('153', 'Fredi Nurahmad', 'BATURETNO', 'Maret', 0, 0, 0, 0, 0, 5, 8, 0),
('296', 'Sandy Ibrahim', 'BANDONGAN', 'Maret', 0, 0, 0, 0, 0, 1, 7, 0),
('063', 'Winda Yaniasari', 'GEMOLONG', 'Maret', 1, 0, 2, 1, 0, 0, 0, 0),
('089', 'Desi Prahastiwi', 'AMPEL', 'Maret', 0, 0, 1, 0, 0, 0, 20, 0),
('247', 'Wara Inggar Listyaningrum', 'SLEMAN', 'Maret', 2, 2, 1, 0, 0, 0, 2, 0),
('120', 'Ifan Baktiar', 'GRABAG', 'Maret', 0, 1, 0, 0, 0, 2, 24, 0),
('007', 'Nala Ratih Anjanida AlMahmudah', 'BANTUL', 'Maret', 0, 2, 1, 1, 0, 0, 17, 0);

-- 5. Masukkan Data FEBRUARI
INSERT INTO staff_progress (id, name, branch, periode, release_voucher, unapprove_pengajuan, recalculate_delinquency, transfer_pencairan, salah_generate, ppi_not_entry, validasi, tiket_perbaikan) VALUES
('052', 'Heni Suryaningsih', 'GONDANG', 'Februari', 0, 0, 0, 0, 0, 0, 1, 0),
('180', 'Alan Agil Warseno', 'PURWANTORO', 'Februari', 1, 0, 0, 0, 0, 0, 5, 0),
('081', 'Giga Mahera', 'PEDAN', 'Februari', 0, 1, 0, 0, 0, 0, 4, 0),
('084', 'Pandu Huda Prasetya', 'KARANGANYAR', 'Februari', 0, 0, 0, 0, 0, 5, 6, 0),
('022', 'Ermi Lanjar Budiyati', 'KULONPROGO', 'Februari', 0, 1, 0, 0, 0, 0, 12, 0),
('124', 'Miftakhurrohman', 'BOROBUDUR', 'Februari', 0, 2, 0, 0, 0, 0, 12, 0),
('153', 'Fredi Nurahmad', 'BATURETNO', 'Februari', 0, 1, 0, 0, 0, 5, 8, 0),
('296', 'Sandy Ibrahim', 'BANDONGAN', 'Februari', 0, 2, 0, 0, 0, 1, 7, 0),
('007', 'Nala Ratih Anjanida AlMahmudah', 'BANTUL', 'Februari', 0, 2, 0, 0, 0, 0, 16, 0),
('071', 'Yeni Suryani', 'JATINOM', 'Februari', 0, 2, 0, 1, 0, 0, 3, 0),
('282', 'Meilina Rahmawati', 'KARTASURA', 'Februari', 0, 2, 0, 0, 0, 0, 17, 0),
('063', 'Winda Yaniasari', 'GEMOLONG', 'Februari', 0, 2, 0, 0, 0, 0, 22, 0),
('207', 'Febia Mita Ambarwati', 'SUKOHARJO', 'Februari', 3, 2, 1, 0, 0, 2, 0, 0),
('132', 'Sigit Raharjo', 'AMBARAWA', 'Februari', 1, 2, 1, 0, 0, 0, 8, 0),
('160', 'Azza Avita Santi', 'WONOSARI', 'Februari', 1, 3, 0, 0, 0, 0, 29, 0),
('297', 'Muhamad Khasnan Khabib', 'KARANGGEDE', 'Februari', 1, 2, 0, 1, 0, 0, 10, 0),
('089', 'Desi Prahastiwi', 'AMPEL', 'Februari', 3, 7, 0, 0, 0, 0, 20, 0),
('247', 'Wara Inggar Listyaningrum', 'SLEMAN', 'Februari', 3, 5, 1, 1, 0, 0, 1, 0),
('158', 'Sulastri', 'PACITAN', 'Februari', 5, 6, 0, 0, 0, 0, 47, 0),
('120', 'Ifan Baktiar', 'GRABAG', 'Februari', 1, 2, 0, 0, 2, 2, 24, 0);

-- 6. Hapus View lama dan buat baru agar strukturnya (kolom periode) sinkron
DROP VIEW IF EXISTS v_staff_report;

CREATE VIEW v_staff_report AS
SELECT 
  *,
  CASE WHEN release_voucher = 0 THEN 10 WHEN release_voucher = 1 THEN 8 WHEN release_voucher BETWEEN 2 AND 3 THEN 7 WHEN release_voucher BETWEEN 4 AND 5 THEN 6 WHEN release_voucher BETWEEN 6 AND 7 THEN 5 WHEN release_voucher BETWEEN 8 AND 10 THEN 4 WHEN release_voucher BETWEEN 11 AND 13 THEN 3 WHEN release_voucher BETWEEN 14 AND 16 THEN 2 WHEN release_voucher BETWEEN 17 AND 20 THEN 1 ELSE 0 END as p_rv,
  CASE WHEN unapprove_pengajuan = 0 THEN 10 WHEN unapprove_pengajuan = 1 THEN 7 WHEN unapprove_pengajuan BETWEEN 2 AND 3 THEN 5 WHEN unapprove_pengajuan BETWEEN 4 AND 5 THEN 3 WHEN unapprove_pengajuan BETWEEN 6 AND 7 THEN 2 WHEN unapprove_pengajuan BETWEEN 8 AND 10 THEN 1 ELSE 0 END as p_up,
  CASE WHEN recalculate_delinquency = 0 THEN 15 WHEN recalculate_delinquency = 1 THEN 11 WHEN recalculate_delinquency BETWEEN 2 AND 3 THEN 9 WHEN recalculate_delinquency BETWEEN 4 AND 5 THEN 7 WHEN recalculate_delinquency BETWEEN 6 AND 7 THEN 5 WHEN recalculate_delinquency BETWEEN 8 AND 10 THEN 3 WHEN recalculate_delinquency BETWEEN 11 AND 13 THEN 1 ELSE 0 END as p_rd,
  CASE WHEN transfer_pencairan = 0 THEN 15 WHEN transfer_pencairan = 1 THEN 10 WHEN transfer_pencairan BETWEEN 2 AND 3 THEN 5 WHEN transfer_pencairan BETWEEN 4 AND 5 THEN 1 ELSE 0 END as p_tp,
  CASE WHEN salah_generate = 0 THEN 15 WHEN salah_generate = 1 THEN 11 WHEN salah_generate BETWEEN 2 AND 3 THEN 9 WHEN salah_generate BETWEEN 4 AND 5 THEN 7 WHEN salah_generate BETWEEN 6 AND 7 THEN 5 ELSE 0 END as p_sg,
  CASE WHEN ppi_not_entry = 0 THEN 10 WHEN ppi_not_entry = 1 THEN 8 WHEN ppi_not_entry BETWEEN 2 AND 3 THEN 7 WHEN ppi_not_entry BETWEEN 4 AND 5 THEN 7 WHEN ppi_not_entry BETWEEN 6 AND 7 THEN 5 WHEN ppi_not_entry BETWEEN 8 AND 10 THEN 5 WHEN ppi_not_entry BETWEEN 11 AND 13 THEN 3 WHEN ppi_not_entry BETWEEN 14 AND 16 THEN 2 WHEN ppi_not_entry BETWEEN 17 AND 20 THEN 1 ELSE 0 END as p_ppi,
  CASE WHEN validasi = 0 THEN 10 WHEN validasi = 1 THEN 8 WHEN validasi BETWEEN 2 AND 3 THEN 7 WHEN validasi BETWEEN 4 AND 5 THEN 6 WHEN validasi BETWEEN 6 AND 7 THEN 5 WHEN validasi BETWEEN 8 AND 10 THEN 4 WHEN validasi BETWEEN 11 AND 13 THEN 3 WHEN validasi BETWEEN 14 AND 16 THEN 2 WHEN validasi BETWEEN 17 AND 20 THEN 1 ELSE 0 END as p_val,
  CASE WHEN tiket_perbaikan = 0 THEN 15 WHEN tiket_perbaikan = 1 THEN 5 WHEN tiket_perbaikan BETWEEN 2 AND 3 THEN 2 WHEN tiket_perbaikan BETWEEN 4 AND 5 THEN 1 ELSE 0 END as p_tpk
FROM staff_progress;
