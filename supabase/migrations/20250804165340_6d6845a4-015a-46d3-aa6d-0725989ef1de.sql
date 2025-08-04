-- Add missing RLS policy for admins to delete any equipment
CREATE POLICY "Admins can delete any equipment" 
ON public.equipment 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'::app_role
  )
);