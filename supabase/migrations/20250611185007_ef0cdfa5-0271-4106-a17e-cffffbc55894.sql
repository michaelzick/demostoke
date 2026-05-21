
-- Create a global application settings table
CREATE TABLE public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on app_settings
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read app settings (for public access)
CREATE POLICY "Anyone can read app settings" 
ON public.app_settings 
FOR SELECT 
TO public;

-- Only admins can modify app settings
CREATE POLICY "Admins can modify app settings" 
ON public.app_settings 
FOR ALL
USING (public.is_admin(auth.uid()));

-- Insert the default mock data setting
INSERT INTO public.app_settings (setting_key, setting_value)
VALUES ('show_mock_data', 'true'::jsonb);

-- Create a function to get app setting value
CREATE OR REPLACE FUNCTION public.get_app_setting(key TEXT)
RETURNS JSONB
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT setting_value FROM public.app_settings WHERE setting_key = key LIMIT 1;
$$;
