
-- Allow everyone (including unauthenticated users) to read app settings
CREATE POLICY "Allow public read access to app settings" 
  ON public.app_settings 
  FOR SELECT 
  TO anon, authenticated 
  USING (true);

-- Only authenticated admins can update app settings
CREATE POLICY "Only admins can update app settings" 
  ON public.app_settings 
  FOR UPDATE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Only authenticated admins can insert app settings
CREATE POLICY "Only admins can insert app settings" 
  ON public.app_settings 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
;
