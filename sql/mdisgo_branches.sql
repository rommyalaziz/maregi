-- =============================================
-- MDISGO BRANCHES TABLE - Run in Supabase SQL Editor
-- =============================================

-- 1. Drop old table if exists (from previous version)
DROP TABLE IF EXISTS mdisgo_branches;

-- 2. Create the table with branch_code
CREATE TABLE mdisgo_branches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_code TEXT NOT NULL,
  branch_name TEXT NOT NULL,
  training_date DATE,
  members_accessed INTEGER DEFAULT 0,
  status TEXT DEFAULT 'Belum' CHECK (status IN ('Active', 'Completed', 'Belum')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable RLS with open policy
ALTER TABLE mdisgo_branches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to mdisgo_branches"
  ON mdisgo_branches
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 4. Seed data - 20 cabang (urut abjad)
INSERT INTO mdisgo_branches (branch_code, branch_name, training_date, members_accessed, status) VALUES
  ('089', 'AMPEL',        NULL, 0, 'Belum'),
  ('132', 'AMBARAWA',     NULL, 0, 'Belum'),
  ('296', 'BANDONGAN',    NULL, 0, 'Belum'),
  ('007', 'BANTUL',       NULL, 0, 'Belum'),
  ('153', 'BATURETNO',    NULL, 0, 'Belum'),
  ('124', 'BOROBUDUR',    NULL, 0, 'Belum'),
  ('063', 'GEMOLONG',     NULL, 0, 'Belum'),
  ('052', 'GONDANG',      NULL, 0, 'Belum'),
  ('120', 'GRABAG',       NULL, 0, 'Belum'),
  ('071', 'JATINOM',      NULL, 0, 'Belum'),
  ('084', 'KARANGANYAR',  NULL, 0, 'Belum'),
  ('297', 'KARANGGEDE',   NULL, 0, 'Belum'),
  ('282', 'KARTASURA',    NULL, 0, 'Belum'),
  ('022', 'KULONPROGO',   NULL, 0, 'Belum'),
  ('158', 'PACITAN',      NULL, 0, 'Belum'),
  ('081', 'PEDAN',        NULL, 0, 'Belum'),
  ('180', 'PURWANTORO',   NULL, 0, 'Belum'),
  ('247', 'SLEMAN',       NULL, 0, 'Belum'),
  ('207', 'SUKOHARJO',    NULL, 0, 'Belum'),
  ('160', 'WONOSARI',     NULL, 0, 'Belum');
