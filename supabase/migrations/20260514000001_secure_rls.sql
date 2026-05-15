-- Drop the broad "Allow all" policies
DROP POLICY IF EXISTS "Allow all access to call_logs_table" ON call_logs_table;
DROP POLICY IF EXISTS "Allow all access to settings_table" ON settings_table;

-- Create secure policies for authenticated users
CREATE POLICY "Allow authenticated access to call_logs_table"
  ON call_logs_table FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

CREATE POLICY "Allow authenticated access to settings_table"
  ON settings_table FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);
