-- ============================================================
-- SIREGI - Setup Tabel Kunjungan Cabang
-- Jalankan script ini di Supabase Dashboard > SQL Editor
-- ============================================================

-- Drop tabel jika sudah ada (hati-hati di production!)
-- DROP TABLE IF EXISTS kunjungan_cabang;

CREATE TABLE IF NOT EXISTS kunjungan_cabang (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Identitas Kunjungan
  nama_cabang        TEXT NOT NULL,
  nama_msa           TEXT NOT NULL,
  tanggal_kunjungan  DATE NOT NULL,

  -- ============================================================
  -- CHECKLIST EVALUASI
  -- ============================================================

  -- [A] Backup & Arsip Digital
  c_backup_owncloud      BOOLEAN DEFAULT false,  -- Backup data sudah masuk ke OwnCloud
  c_folder_d_rapi        BOOLEAN DEFAULT false,  -- Struktur folder D:\ sudah rapi
  -- Dokumen Harian Sudah Discan:
  c_dok_surat_ceklist    BOOLEAN DEFAULT false,  -- Data Surat Ceklist
  c_dok_data_anggota     BOOLEAN DEFAULT false,  -- Data Anggota
  c_dok_anggota_keluar   BOOLEAN DEFAULT false,  -- Anggota Keluar
  c_dok_dana_resiko      BOOLEAN DEFAULT false,  -- Dana Resiko
  c_dok_sihara           BOOLEAN DEFAULT false,  -- SIHARA
  c_dok_laporan_bulanan  BOOLEAN DEFAULT false,  -- Laporan Bulanan
  c_dok_lwk              BOOLEAN DEFAULT false,  -- Data LWK

  -- [B] MDISMO & Sistem
  c_sinkron_mdismo       BOOLEAN DEFAULT false,  -- Sinkron MDISMO sudah dilakukan hari ini
  c_pending_mdis         BOOLEAN DEFAULT false,  -- Pendingan data MDIS ijo sudah dicek
  c_email_arsip          BOOLEAN DEFAULT false,  -- Email sudah diarsipkan ke folder digital

  -- [C] Operasional Harian
  c_briefing_buku_tamu   BOOLEAN DEFAULT false,  -- Briefing pagi dan buku tamu terisi
  c_kpa_akad             BOOLEAN DEFAULT false,  -- KPA dan Akad pencairan sudah disiapkan
  c_stok_formulir        BOOLEAN DEFAULT false,  -- Stok formulir operasional masih cukup

  -- [D] Kontrol & Kepatuhan
  c_sampling_phone       BOOLEAN DEFAULT false,  -- Sampling by phone sudah dilakukan
  c_penyimpangan_ada     BOOLEAN DEFAULT false,  -- Ada penyimpangan data belum dilaporkan (true=Ada)

  -- [E] Aset & IT
  c_maintenance_komputer BOOLEAN DEFAULT false,  -- Maintenance komputer bulan ini sudah dilakukan
  c_stok_toner           BOOLEAN DEFAULT false,  -- Stok toner masih aman
  c_fixed_asset          BOOLEAN DEFAULT false,  -- Nomor dan kondisi fixed asset sudah dicek

  -- ============================================================
  -- DATA ISIAN TAMBAHAN
  -- ============================================================
  catatan_kendala        TEXT DEFAULT '',
  tindak_lanjut          TEXT DEFAULT '',
  kesimpulan             TEXT DEFAULT '',
  status_laporan         TEXT DEFAULT 'Draft' CHECK (
    status_laporan IN ('Draft', 'Selesai', 'Perlu Tindak Lanjut')
  ),

  -- Metadata
  created_by   TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CONSTRAINT: 1 cabang hanya bisa dikunjungi 1x per tanggal
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'unique_cabang_tanggal'
  ) THEN
    ALTER TABLE kunjungan_cabang
      ADD CONSTRAINT unique_cabang_tanggal UNIQUE (nama_cabang, tanggal_kunjungan);
  END IF;
END $$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE kunjungan_cabang ENABLE ROW LEVEL SECURITY;

-- Policy: admin bisa melakukan semua operasi
DROP POLICY IF EXISTS "Admin full access kunjungan" ON kunjungan_cabang;
CREATE POLICY "Admin full access kunjungan" ON kunjungan_cabang
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- INDEX untuk performa query
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_kunjungan_tanggal ON kunjungan_cabang (tanggal_kunjungan DESC);
CREATE INDEX IF NOT EXISTS idx_kunjungan_cabang ON kunjungan_cabang (nama_cabang);
CREATE INDEX IF NOT EXISTS idx_kunjungan_status ON kunjungan_cabang (status_laporan);

-- ============================================================
-- SELESAI
-- Tabel kunjungan_cabang siap digunakan.
-- Total checklist: 20 item dalam 5 kategori.
-- ============================================================
