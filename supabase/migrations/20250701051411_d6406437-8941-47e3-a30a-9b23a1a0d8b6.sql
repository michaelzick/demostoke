
-- Update RLS policies for demo_calendar to restrict edit/delete to admins only
DROP POLICY IF EXISTS "Users can update their own demo events" ON public.demo_calendar;
DROP POLICY IF EXISTS "Users can delete their own demo events" ON public.demo_calendar;

-- Create new policies that only allow admins to update and delete
CREATE POLICY "Only admins can update demo events" 
  ON public.demo_calendar 
  FOR UPDATE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete demo events" 
  ON public.demo_calendar 
  FOR DELETE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
;
