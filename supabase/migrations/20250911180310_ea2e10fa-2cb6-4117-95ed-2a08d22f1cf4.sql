-- Fix security audit log access by ensuring RLS is properly enabled and policies are correct

-- First, verify RLS is enabled on security_audit_log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.security_audit_log;

-- Create a more restrictive policy for security audit logs
-- Only admins can read audit logs
CREATE POLICY "Only admins can read security audit logs" 
ON public.security_audit_log 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::app_role
  )
);

-- Ensure no other operations are allowed except for the system to insert logs
-- Allow system/service role to insert audit logs (for logging function)
CREATE POLICY "Allow system to insert audit logs" 
ON public.security_audit_log 
FOR INSERT 
WITH CHECK (true);

-- Block all other operations for regular users
CREATE POLICY "Block all updates on audit logs" 
ON public.security_audit_log 
FOR UPDATE 
TO authenticated
USING (false);

CREATE POLICY "Block all deletes on audit logs" 
ON public.security_audit_log 
FOR DELETE 
TO authenticated
USING (false);