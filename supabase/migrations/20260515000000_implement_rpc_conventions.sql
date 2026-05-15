-- Implement RPC Coding Conventions
-- As specified in docs/PLPGSQL_RPC_CODING_CONVENTIONS.md

-- 1. Create Call Log
CREATE OR REPLACE FUNCTION public.create_call_log(input_data JSON)
RETURNS JSONB
SET search_path TO ''
SECURITY DEFINER
AS $$
DECLARE
  -- Input variables
  input_id UUID := (input_data->>'id')::UUID;
  input_requested_by TEXT := (input_data->>'requested_by')::TEXT;
  input_last_name TEXT := (input_data->>'last_name')::TEXT;
  input_room_no TEXT := (input_data->>'room_no')::TEXT;
  input_guest_req TEXT := (input_data->>'guest_req')::TEXT;
  input_time_of_request TEXT := (input_data->>'time_of_request')::TEXT;
  input_time_of_delivered TEXT := COALESCE((input_data->>'time_of_delivered')::TEXT, '');
  input_remarks TEXT := COALESCE((input_data->>'remarks')::TEXT, '');
  input_created_at BIGINT := (input_data->>'created_at')::BIGINT;
  input_call_type TEXT := (input_data->>'call_type')::TEXT;
  input_user_id UUID := (input_data->>'user_id')::UUID;
  input_date_id UUID := (input_data->>'date_id')::UUID;

  -- Return variable
  return_data JSONB;
BEGIN
  INSERT INTO public.call_logs_table (
    call_logs_id,
    call_logs_requested_by,
    call_logs_last_name,
    call_logs_room_no,
    call_logs_guest_req,
    call_logs_time_of_request,
    call_logs_time_of_delivered,
    call_logs_remarks,
    call_logs_follow_up,
    call_logs_acknowledged_by,
    call_logs_created_at,
    call_logs_call_type,
    call_logs_user_id,
    call_logs_date_id
  ) VALUES (
    input_id,
    input_requested_by,
    input_last_name,
    input_room_no,
    input_guest_req,
    input_time_of_request,
    input_time_of_delivered,
    input_remarks,
    0,
    '',
    input_created_at,
    input_call_type,
    input_user_id,
    input_date_id
  )
  RETURNING to_jsonb(call_logs_table.*) INTO return_data;

  RETURN return_data;
END;
$$ LANGUAGE plpgsql;

-- 2. Get Call Logs
CREATE OR REPLACE FUNCTION public.get_call_logs(input_data JSON)
RETURNS JSONB
SET search_path TO ''
SECURITY DEFINER
AS $$
DECLARE
  -- Return variable
  return_data JSONB;
BEGIN
  SELECT jsonb_agg(call_logs_data)
  INTO return_data
  FROM (
    SELECT *
    FROM public.call_logs_table AS call_logs_table
    ORDER BY call_logs_table.call_logs_created_at DESC
  ) AS call_logs_data;

  RETURN COALESCE(return_data, '[]'::JSONB);
END;
$$ LANGUAGE plpgsql;

-- 3. Update Call Log
CREATE OR REPLACE FUNCTION public.update_call_log(input_data JSON)
RETURNS JSONB
SET search_path TO ''
SECURITY DEFINER
AS $$
DECLARE
  -- Input variables
  input_id UUID := (input_data->>'id')::UUID;
  input_updates JSONB := (input_data->'updates')::JSONB;

  -- Return variable
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
    call_logs_call_type = COALESCE((input_updates->>'call_type')::TEXT, call_logs_call_type),
    call_logs_user_id = COALESCE((input_updates->>'user_id')::UUID, call_logs_user_id),
    call_logs_date_id = COALESCE((input_updates->>'date_id')::UUID, call_logs_date_id)
  WHERE call_logs_id = input_id
  RETURNING to_jsonb(call_logs_table.*) INTO return_data;

  RETURN return_data;
END;
$$ LANGUAGE plpgsql;

-- 4. Delete Call Log
CREATE OR REPLACE FUNCTION public.delete_call_log(input_data JSON)
RETURNS JSONB
SET search_path TO ''
SECURITY DEFINER
AS $$
DECLARE
  -- Input variables
  input_id UUID := (input_data->>'id')::UUID;

  -- Return variable
  return_data JSONB;
BEGIN
  DELETE FROM public.call_logs_table
  WHERE call_logs_id = input_id
  RETURNING to_jsonb(call_logs_table.*) INTO return_data;

  RETURN return_data;
END;
$$ LANGUAGE plpgsql;

-- 5. Clear All Logs
CREATE OR REPLACE FUNCTION public.clear_all_logs(input_data JSON)
RETURNS JSONB
SET search_path TO ''
SECURITY DEFINER
AS $$
DECLARE
  -- Return variable
  return_data JSONB;
BEGIN
  DELETE FROM public.call_logs_table;
  
  return_data := jsonb_build_object('status', 'success');
  RETURN return_data;
END;
$$ LANGUAGE plpgsql;

-- 6. Get Settings
CREATE OR REPLACE FUNCTION public.get_settings(input_data JSON)
RETURNS JSONB
SET search_path TO ''
SECURITY DEFINER
AS $$
DECLARE
  -- Return variable
  return_data JSONB;
BEGIN
  SELECT to_jsonb(settings_table.*)
  INTO return_data
  FROM public.settings_table AS settings_table
  LIMIT 1;

  RETURN return_data;
END;
$$ LANGUAGE plpgsql;

-- 7. Update Settings
CREATE OR REPLACE FUNCTION public.update_settings(input_data JSON)
RETURNS JSONB
SET search_path TO ''
SECURITY DEFINER
AS $$
DECLARE
  -- Input variables
  input_updates JSONB := (input_data->'updates')::JSONB;
  
  -- Function variables
  var_existing_id UUID;

  -- Return variable
  return_data JSONB;
BEGIN
  SELECT settings_table.settings_id
  INTO var_existing_id
  FROM public.settings_table AS settings_table
  LIMIT 1;

  IF var_existing_id IS NOT NULL THEN
    UPDATE public.settings_table
    SET
      settings_privacy_mode = COALESCE((input_updates->>'privacy_mode')::BOOLEAN, settings_privacy_mode),
      settings_terms_accepted = COALESCE((input_updates->>'terms_accepted')::BOOLEAN, settings_terms_accepted),
      settings_active_account = COALESCE((input_updates->>'active_account')::TEXT, settings_active_account),
      settings_updated_at = NOW()
    WHERE settings_id = var_existing_id
    RETURNING to_jsonb(settings_table.*) INTO return_data;
  ELSE
    INSERT INTO public.settings_table (
      settings_privacy_mode,
      settings_terms_accepted,
      settings_active_account
    ) VALUES (
      COALESCE((input_updates->>'privacy_mode')::BOOLEAN, FALSE),
      COALESCE((input_updates->>'terms_accepted')::BOOLEAN, FALSE),
      COALESCE((input_updates->>'active_account')::TEXT, 'cly')
    )
    RETURNING to_jsonb(settings_table.*) INTO return_data;
  END IF;

  RETURN return_data;
END;
$$ LANGUAGE plpgsql;
-- 8. Get User Profile
CREATE OR REPLACE FUNCTION public.get_user_profile(input_data JSON)
RETURNS JSONB
SET search_path TO ''
SECURITY DEFINER
AS $$
DECLARE
  -- Input variables
  input_user_id UUID := (input_data->>'user_id')::UUID;

  -- Return variable
  return_data JSONB;
BEGIN
  SELECT to_jsonb(user_table.*)
  INTO return_data
  FROM public.user_table AS user_table
  WHERE user_id = input_user_id;

  RETURN return_data;
END;
$$ LANGUAGE plpgsql;
