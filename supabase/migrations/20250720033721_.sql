-- Fix the trigger to NOT automatically insert a role when admins create users
-- This allows admin-created users to have their display_role set properly

-- First, drop the existing trigger that always sets 'retail-store'
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;

-- Update the trigger function to be more flexible
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Only insert a default role if no role exists for this user yet
  -- This prevents overriding admin-set roles during user creation
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = NEW.id) THEN
    INSERT INTO public.user_roles (user_id, role, display_role)
    VALUES (NEW.id, 'user', 'retail-store');
  END IF;
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER handle_new_user
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_role();;
