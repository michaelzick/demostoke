-- Add a zero-argument admin helper so RPC calls and RLS policies can rely on auth.uid().

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT public.is_admin(auth.uid());
$$;
