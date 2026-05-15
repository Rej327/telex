-- Consolidated Telex Monitoring Schema
-- Version: 1.0.0
-- Order: Enums -> Tables -> Alters -> RPCs -> RLS

-- 1. ENUMS
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'shift_enum' AND typnamespace = 'public'::REGNAMESPACE) THEN
        CREATE TYPE public.shift_enum AS ENUM ('AM', 'PM');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_type_enum' AND typnamespace = 'public'::REGNAMESPACE) THEN
        CREATE TYPE public.user_type_enum AS ENUM ('dev', 'manager', 'telex');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status_enum' AND typnamespace = 'public'::REGNAMESPACE) THEN
        CREATE TYPE public.user_status_enum AS ENUM ('unverified', 'verified');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'call_type_enum' AND typnamespace = 'public'::REGNAMESPACE) THEN
        CREATE TYPE public.call_type_enum AS ENUM ('guest', 'res_in', 'res_out', 'inq_in', 'inq_out', 'booking_confirmation');
    END IF;
END $$;

-- 2. TABLES
CREATE TABLE IF NOT EXISTS public.settings_table (
  settings_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  settings_privacy_mode BOOLEAN DEFAULT FALSE,
  settings_terms_accepted BOOLEAN DEFAULT FALSE,
  settings_active_account TEXT DEFAULT 'cly',
  settings_updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.user_table (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL UNIQUE,
  user_username TEXT NOT NULL UNIQUE,
  user_type public.user_type_enum NOT NULL DEFAULT 'telex',
  user_status public.user_status_enum NOT NULL DEFAULT 'unverified',
  user_updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.date_table (
  date_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date_date DATE NOT NULL,
  date_shift public.shift_enum NOT NULL,
  date_user_id UUID REFERENCES public.user_table(user_id),
  date_created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL,
  UNIQUE(date_date, date_shift, date_user_id)
);

CREATE TABLE IF NOT EXISTS public.call_logs_table (
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
  call_logs_call_type public.call_type_enum NOT NULL DEFAULT 'guest',
  call_logs_user_id UUID REFERENCES public.user_table(user_id),
  call_logs_date_id UUID REFERENCES public.date_table(date_id)
);

-- 3. RPC FUNCTIONS

-- 3.1 Create Call Log (With Auto-Session Management)
CREATE OR REPLACE FUNCTION public.create_call_log(input_data JSON)
RETURNS JSONB
SET search_path TO ''
SECURITY DEFINER
AS $$
DECLARE
  input_id UUID := (input_data->>'id')::UUID;
  input_requested_by TEXT := (input_data->>'requested_by')::TEXT;
  input_last_name TEXT := (input_data->>'last_name')::TEXT;
  input_room_no TEXT := (input_data->>'room_no')::TEXT;
  input_guest_req TEXT := (input_data->>'guest_req')::TEXT;
  input_time_of_request TEXT := (input_data->>'time_of_request')::TEXT;
  input_time_of_delivered TEXT := COALESCE((input_data->>'time_of_delivered')::TEXT, '');
  input_remarks TEXT := COALESCE((input_data->>'remarks')::TEXT, '');
  input_created_at BIGINT := (input_data->>'created_at')::BIGINT;
  input_call_type public.call_type_enum := (input_data->>'call_type')::public.call_type_enum;
  input_user_id UUID := (input_data->>'user_id')::UUID;
  
  input_date DATE := COALESCE((input_data->>'session_date')::DATE, CURRENT_DATE);
  input_shift public.shift_enum := COALESCE((input_data->>'session_shift')::public.shift_enum, CASE WHEN EXTRACT(HOUR FROM NOW()) < 15 THEN 'AM'::public.shift_enum ELSE 'PM'::public.shift_enum END);
  target_date_id UUID;
  return_data JSONB;
BEGIN
  SELECT date_id INTO target_date_id FROM public.date_table
  WHERE date_date = input_date AND date_shift = input_shift AND date_user_id = input_user_id;

  IF target_date_id IS NULL THEN
    INSERT INTO public.date_table (date_date, date_shift, date_user_id)
    VALUES (input_date, input_shift, input_user_id) RETURNING date_id INTO target_date_id;
  END IF;

  INSERT INTO public.call_logs_table (
    call_logs_id, call_logs_requested_by, call_logs_last_name, call_logs_room_no,
    call_logs_guest_req, call_logs_time_of_request, call_logs_time_of_delivered,
    call_logs_remarks, call_logs_follow_up, call_logs_acknowledged_by,
    call_logs_created_at, call_logs_call_type, call_logs_user_id, call_logs_date_id
  ) VALUES (
    input_id, input_requested_by, input_last_name, input_room_no,
    input_guest_req, input_time_of_request, input_time_of_delivered,
    input_remarks, 0, '', input_created_at, input_call_type, input_user_id, target_date_id
  ) RETURNING to_jsonb(call_logs_table.*) INTO return_data;
  RETURN return_data;
END;
$$ LANGUAGE plpgsql;

-- 3.2 Get Call Logs (Filtered by Session)
CREATE OR REPLACE FUNCTION public.get_call_logs(input_data JSON)
RETURNS JSONB
SET search_path TO ''
SECURITY DEFINER
AS $$
DECLARE
  input_date DATE := COALESCE((input_data->>'session_date')::DATE, CURRENT_DATE);
  input_shift public.shift_enum := COALESCE((input_data->>'session_shift')::public.shift_enum, CASE WHEN EXTRACT(HOUR FROM NOW()) < 15 THEN 'AM'::public.shift_enum ELSE 'PM'::public.shift_enum END);
  return_data JSONB;
BEGIN
  SELECT jsonb_agg(call_logs_data) INTO return_data
  FROM (
    SELECT l.* FROM public.call_logs_table l
    JOIN public.date_table d ON l.call_logs_date_id = d.date_id
    WHERE d.date_date = input_date AND d.date_shift = input_shift
    ORDER BY l.call_logs_created_at DESC
  ) AS call_logs_data;
  RETURN COALESCE(return_data, '[]'::JSONB);
END;
$$ LANGUAGE plpgsql;

-- 3.3 Update Call Log
CREATE OR REPLACE FUNCTION public.update_call_log(input_data JSON)
RETURNS JSONB
SET search_path TO ''
SECURITY DEFINER
AS $$
DECLARE
  input_id UUID := (input_data->>'id')::UUID;
  input_updates JSONB := (input_data->'updates')::JSONB;
  return_data JSONB;
BEGIN
  UPDATE public.call_logs_table
  SET
    call_logs_requested_by = COALESCE((input_updates->>'requested_by')::TEXT, call_logs_requested_by),
    call_logs_last_name = COALESCE((input_updates->>'last_name')::TEXT, call_logs_last_name),
    call_logs_room_no = COALESCE((input_updates->>'room_no')::TEXT, call_logs_room_no),
    call_logs_guest_req = COALESCE((input_updates->>'guest_req')::TEXT, call_logs_guest_req),
    call_logs_time_of_request = COALESCE((input_updates->>'time_of_request')::TEXT, call_logs_time_of_request),
    call_logs_time_of_delivered = COALESCE((input_updates->>'time_of_delivered')::TEXT, call_logs_time_of_delivered),
    call_logs_remarks = COALESCE((input_updates->>'remarks')::TEXT, call_logs_remarks),
    call_logs_follow_up = COALESCE((input_updates->>'follow_up')::INTEGER, call_logs_follow_up),
    call_logs_acknowledged_by = COALESCE((input_updates->>'acknowledged_by')::TEXT, call_logs_acknowledged_by),
    call_logs_call_type = COALESCE((input_updates->>'call_type')::public.call_type_enum, call_logs_call_type),
    call_logs_user_id = COALESCE((input_updates->>'user_id')::UUID, call_logs_user_id),
    call_logs_date_id = COALESCE((input_updates->>'date_id')::UUID, call_logs_date_id)
  WHERE call_logs_id = input_id
  RETURNING to_jsonb(call_logs_table.*) INTO return_data;
  RETURN return_data;
END;
$$ LANGUAGE plpgsql;

-- 3.4 Settings and Profile Functions
CREATE OR REPLACE FUNCTION public.get_settings(input_data JSON) RETURNS JSONB SET search_path TO '' SECURITY DEFINER AS $$
BEGIN RETURN (SELECT to_jsonb(settings_table.*) FROM public.settings_table LIMIT 1); END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_settings(input_data JSON) RETURNS JSONB SET search_path TO '' SECURITY DEFINER AS $$
DECLARE input_updates JSONB := (input_data->'updates')::JSONB; var_id UUID; return_data JSONB;
BEGIN
  SELECT settings_id INTO var_id FROM public.settings_table LIMIT 1;
  IF var_id IS NOT NULL THEN
    UPDATE public.settings_table SET settings_privacy_mode = COALESCE((input_updates->>'privacy_mode')::BOOLEAN, settings_privacy_mode), settings_terms_accepted = COALESCE((input_updates->>'terms_accepted')::BOOLEAN, settings_terms_accepted), settings_active_account = COALESCE((input_updates->>'active_account')::TEXT, settings_active_account), settings_updated_at = NOW() WHERE settings_id = var_id RETURNING to_jsonb(settings_table.*) INTO return_data;
  ELSE
    INSERT INTO public.settings_table (settings_privacy_mode, settings_terms_accepted, settings_active_account) VALUES (COALESCE((input_updates->>'privacy_mode')::BOOLEAN, FALSE), COALESCE((input_updates->>'terms_accepted')::BOOLEAN, FALSE), COALESCE((input_updates->>'active_account')::TEXT, 'cly')) RETURNING to_jsonb(settings_table.*) INTO return_data;
  END IF;
  RETURN return_data;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.get_user_profile(input_data JSON) RETURNS JSONB SET search_path TO '' SECURITY DEFINER AS $$
BEGIN RETURN (SELECT to_jsonb(user_table.*) FROM public.user_table WHERE user_id = (input_data->>'user_id')::UUID); END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.get_archive_logs() RETURNS JSONB SET search_path TO '' SECURITY DEFINER AS $$
BEGIN
  RETURN (SELECT jsonb_agg(d) FROM (SELECT l.*, u.user_username, d.date_date, d.date_shift FROM public.call_logs_table l LEFT JOIN public.user_table u ON l.call_logs_user_id = u.user_id LEFT JOIN public.date_table d ON l.call_logs_date_id = d.date_id ORDER BY l.call_logs_created_at DESC) d);
END; $$ LANGUAGE plpgsql;

-- 4. POLICIES (RLS)
ALTER TABLE public.settings_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.date_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_logs_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated access to settings_table" ON public.settings_table FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Allow authenticated access to user_table" ON public.user_table FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Allow authenticated access to date_table" ON public.date_table FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Allow authenticated access to call_logs_table" ON public.call_logs_table FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
