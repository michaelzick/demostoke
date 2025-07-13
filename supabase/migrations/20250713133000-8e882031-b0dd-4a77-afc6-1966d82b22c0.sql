-- Add display_role column to user_roles and allow users to update their own display role
ALTER TABLE public.user_roles
ADD COLUMN IF NOT EXISTS display_role TEXT DEFAULT 'retail-store';

-- Allow users to update their display role while preventing privilege escalation
CREATE POLICY "Users can update their own display role"
ON public.user_roles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
);

-- Update trigger function to insert default display role for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role, display_role)
  VALUES (NEW.id, 'user', 'retail-store');
  RETURN NEW;
END;
$$;

-- Create trigger to call the handle_new_user_role function when a new user is created
CREATE TRIGGER handle_new_user
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_role();
