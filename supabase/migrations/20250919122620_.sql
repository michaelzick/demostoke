-- Drop existing policies that allow public access
DROP POLICY IF EXISTS "Users can create their own figma connections" ON public.figma_connections;
DROP POLICY IF EXISTS "Users can delete their own figma connections" ON public.figma_connections;
DROP POLICY IF EXISTS "Users can update their own figma connections" ON public.figma_connections;
DROP POLICY IF EXISTS "Users can view their own figma connections" ON public.figma_connections;

-- Create secure RLS policies that require authentication
CREATE POLICY "Authenticated users can create their own figma connections" 
ON public.figma_connections 
FOR INSERT 
TO authenticated 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Authenticated users can view their own figma connections" 
ON public.figma_connections 
FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can update their own figma connections" 
ON public.figma_connections 
FOR UPDATE 
TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can delete their own figma connections" 
ON public.figma_connections 
FOR DELETE 
TO authenticated 
USING (user_id = auth.uid());

-- Ensure no anonymous access
CREATE POLICY "Block anonymous access to figma connections" 
ON public.figma_connections 
FOR ALL 
TO anon 
USING (false);;
