-- Fix duplicate triggers causing user creation conflicts
-- Remove the duplicate design system user trigger that's causing conflicts

-- Drop the duplicate triggers (keeping the most recent one)
DROP TRIGGER IF EXISTS on_auth_design_system_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_design_system ON auth.users;

-- Ensure we only have one trigger for design system profiles
-- The handle_new_design_system_user function should only run once per user creation
CREATE OR REPLACE TRIGGER on_auth_user_created_design_system
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_design_system_user();

-- Also update the function to handle conflicts gracefully
CREATE OR REPLACE FUNCTION public.handle_new_design_system_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Use INSERT ... ON CONFLICT to prevent duplicate key errors
  INSERT INTO public.design_system_profiles (user_id, display_name, avatar_url)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), 'https://api.dicebear.com/6.x/avataaars/svg?seed=' || NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$function$;;
