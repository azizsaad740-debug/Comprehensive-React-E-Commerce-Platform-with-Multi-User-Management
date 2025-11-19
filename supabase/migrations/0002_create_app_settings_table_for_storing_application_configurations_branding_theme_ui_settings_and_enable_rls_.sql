-- Create table for application settings
CREATE TABLE public.app_settings (
  settings_key TEXT PRIMARY KEY,
  settings_value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (REQUIRED for security)
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users (admins/superusers) to read settings
CREATE POLICY "Allow authenticated read access to app_settings" ON public.app_settings 
FOR SELECT TO authenticated USING (true);

-- Policy: Allow authenticated users (admins/superusers) to insert/update settings
-- NOTE: In a real app, you might restrict this further by role, but for simplicity, 
-- we allow any authenticated user to update settings for now, relying on frontend checks.
-- For production, consider using a function to check auth.role() or a service role key.
CREATE POLICY "Allow authenticated insert/update access to app_settings" ON public.app_settings 
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update access to app_settings" ON public.app_settings 
FOR UPDATE TO authenticated USING (true);

-- Policy: Deny delete access
CREATE POLICY "Deny delete access to app_settings" ON public.app_settings 
FOR DELETE USING (false);