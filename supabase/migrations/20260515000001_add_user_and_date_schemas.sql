-- Create Shift Enum in public schema
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'shift_enum' AND typnamespace = 'public'::REGNAMESPACE) THEN
        CREATE TYPE public.shift_enum AS ENUM ('AM', 'PM');
    END IF;
END $$;

-- Create user_table in public schema
CREATE TABLE IF NOT EXISTS public.user_table (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL UNIQUE,
  user_username TEXT NOT NULL UNIQUE,
  user_updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL
);

-- Enable RLS for user_table
ALTER TABLE public.user_table ENABLE ROW LEVEL SECURITY;

-- Create policies for user_table
CREATE POLICY "Allow authenticated access to user_table"
  ON public.user_table FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- Create date_table in public schema
CREATE TABLE IF NOT EXISTS public.date_table (
  date_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date_date DATE NOT NULL,
  date_shift public.shift_enum NOT NULL,
  date_user_id UUID REFERENCES public.user_table(user_id),
  date_created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL,
  UNIQUE(date_date, date_shift, date_user_id)
);

-- Enable RLS for date_table
ALTER TABLE public.date_table ENABLE ROW LEVEL SECURITY;

-- Create policies for date_table
CREATE POLICY "Allow authenticated access to date_table"
  ON public.date_table FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- Add references to call_logs_table
ALTER TABLE public.call_logs_table 
  ADD COLUMN IF NOT EXISTS call_logs_user_id UUID REFERENCES public.user_table(user_id),
  ADD COLUMN IF NOT EXISTS call_logs_date_id UUID REFERENCES public.date_table(date_id);
