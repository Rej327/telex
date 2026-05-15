-- Create call_logs_table
CREATE TABLE IF NOT EXISTS call_logs_table (
  call_logs_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_logs_requested_by TEXT NOT NULL,
  call_logs_last_name TEXT NOT NULL,
  call_logs_room_no TEXT NOT NULL,
  call_logs_guest_req TEXT NOT NULL,
  call_logs_time_of_request TEXT NOT NULL,
  call_logs_time_of_delivered TEXT DEFAULT '',
  call_logs_remarks TEXT DEFAULT '',
  call_logs_follow_up INTEGER DEFAULT 0,
  call_logs_acknowledged_by TEXT DEFAULT '',
  call_logs_created_at BIGINT NOT NULL,
  call_logs_call_type TEXT NOT NULL,
  call_logs_inserted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL
);

-- Enable RLS for call_logs_table
ALTER TABLE call_logs_table ENABLE ROW LEVEL SECURITY;

-- Create policies for call_logs_table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'call_logs_table' AND policyname = 'Allow all access to call_logs_table'
  ) THEN
    CREATE POLICY "Allow all access to call_logs_table" ON call_logs_table FOR ALL USING (TRUE) WITH CHECK (TRUE);
  END IF;
END $$;

-- Create settings_table
CREATE TABLE IF NOT EXISTS settings_table (
  settings_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  settings_privacy_mode BOOLEAN DEFAULT FALSE,
  settings_terms_accepted BOOLEAN DEFAULT FALSE,
  settings_active_account TEXT DEFAULT 'cly',
  settings_updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL
);

-- Enable RLS for settings_table
ALTER TABLE settings_table ENABLE ROW LEVEL SECURITY;

-- Create policies for settings_table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'settings_table' AND policyname = 'Allow all access to settings_table'
  ) THEN
    CREATE POLICY "Allow all access to settings_table" ON settings_table FOR ALL USING (TRUE) WITH CHECK (TRUE);
  END IF;
END $$;

-- Insert initial settings if not exists
INSERT INTO settings_table (settings_privacy_mode, settings_terms_accepted, settings_active_account)
SELECT FALSE, FALSE, 'cly'
WHERE NOT EXISTS (SELECT 1 FROM settings_table);
