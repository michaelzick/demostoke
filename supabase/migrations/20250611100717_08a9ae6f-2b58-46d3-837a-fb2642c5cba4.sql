
-- Update get_app_setting function to use plpgsql and set explicit search path
CREATE OR REPLACE FUNCTION public.get_app_setting(key TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN (SELECT setting_value FROM public.app_settings WHERE setting_key = key LIMIT 1);
END;
$$;

-- Update handle_new_user function to include explicit search path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar_url)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), 'https://api.dicebear.com/6.x/avataaars/svg?seed=' || NEW.id);
  RETURN NEW;
END;
$$;

-- Update update_updated_at_column function to include explicit search path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
;
