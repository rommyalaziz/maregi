-- Salin dan tempel perintah ini di Supabase SQL Editor Anda

CREATE TABLE staff_progress (
  id TEXT PRIMARY KEY, -- Ini adalah "Kode"
  name TEXT NOT NULL,
  branch TEXT NOT NULL,
  release_voucher INTEGER DEFAULT 0,
  unapprove_pengajuan INTEGER DEFAULT 0,
  recalculate_delinquency INTEGER DEFAULT 0,
  transfer_pencairan INTEGER DEFAULT 0,
  salah_generate INTEGER DEFAULT 0,
  ppi_not_entry INTEGER DEFAULT 0,
  validasi INTEGER DEFAULT 0,
  tiket_perbaikan INTEGER DEFAULT 0,
  performance INTEGER DEFAULT 100, -- Ini adalah "Poin KPI"
  status TEXT DEFAULT 'on-track', -- 'on-track', 'delayed', 'critical'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contoh Data Awal (Opsional)
INSERT INTO staff_progress (id, name, branch, release_voucher, ppi_not_entry, performance, status)
VALUES 
('022', 'Ermi Lanjar Budiyati', 'KULONPROGO', 0, 0, 100, 'on-track'),
('084', 'Pandu Huda Prasetya', 'KARANGANYAR', 0, 5, 97, 'delayed'),
('089', 'Desi Prahastiwi', 'AMPEL', 0, 20, 78, 'critical');
