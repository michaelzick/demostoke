-- Security Fix: Remove role column from profiles table to eliminate privilege escalation
-- Users should not be able to edit their own roles directly

-- Remove the role column from profiles table
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;

-- Strengthen RLS policies for profiles table
-- Remove the overly permissive policy that allows users to update any profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create more restrictive update policy that prevents critical field modifications
CREATE POLICY "Users can update their own profile data" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Strengthen equipment RLS policies
-- Remove overly permissive policy and replace with more restrictive ones
DROP POLICY IF EXISTS "Users and admins can update equipment" ON public.equipment;

-- Users can only update their own equipment
CREATE POLICY "Users can update their own equipment" 
ON public.equipment 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Admins can update any equipment
CREATE POLICY "Admins can update any equipment" 
ON public.equipment 
FOR UPDATE 
USING (public.is_admin(auth.uid()));

-- Add more restrictive policies for image tables
-- Prevent unauthorized access to processed images
DROP POLICY IF EXISTS "Anyone can read processed_images" ON public.processed_images;
CREATE POLICY "Authenticated users can read processed_images" 
ON public.processed_images 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Strengthen demo calendar policies
DROP POLICY IF EXISTS "Anyone can view demo events" ON public.demo_calendar;
CREATE POLICY "Authenticated users can view demo events" 
ON public.demo_calendar 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Add audit logging for sensitive operations
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" 
ON public.security_audit_log 
FOR SELECT 
USING (public.is_admin(auth.uid()));

-- Function to log sensitive operations
CREATE OR REPLACE FUNCTION public.log_security_event(
  action_type TEXT,
  table_name TEXT DEFAULT NULL,
  record_id UUID DEFAULT NULL,
  old_values JSONB DEFAULT NULL,
  new_values JSONB DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.security_audit_log 
  (user_id, action, table_name, record_id, old_values, new_values)
  VALUES 
  (auth.uid(), action_type, table_name, record_id, old_values, new_values);
END;
$$;;
