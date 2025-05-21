-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id BIGINT PRIMARY KEY,
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up RLS policies
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can view settings
CREATE POLICY "Admins can view settings" ON system_settings
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role_id = 3
    )
  );

-- Only admins can insert settings
CREATE POLICY "Admins can insert settings" ON system_settings
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role_id = 3
    )
  );

-- Only admins can update settings
CREATE POLICY "Admins can update settings" ON system_settings
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role_id = 3
    )
  );
