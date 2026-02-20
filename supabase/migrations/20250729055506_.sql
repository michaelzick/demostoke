-- Fix infinite recursion in user_roles RLS policies by using is_admin() function

-- Drop the problematic admin policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can assign roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;

-- Recreate the admin policies using the is_admin() security definer function
-- This prevents infinite recursion since is_admin() bypasses RLS policies

CREATE POLICY "Admins can assign roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (is_admin());

CREATE POLICY "Admins can delete roles" 
ON public.user_roles 
FOR DELETE 
USING (is_admin());

CREATE POLICY "Admins can update roles" 
ON public.user_roles 
FOR UPDATE 
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (is_admin());;
