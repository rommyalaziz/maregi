-- =============================================
-- APP SETTINGS TABLE - Run in Supabase SQL Editor
-- =============================================

CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Allow all access for now (since we check admin in frontend)
CREATE POLICY "Allow all access to app_settings"
  ON app_settings
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insert default value for MDISGO last updated info
INSERT INTO app_settings (key, value) VALUES ('mdisgo_last_updated', 'Belum ada informasi')
ON CONFLICT (key) DO NOTHING;
