-- Allow anyone to view demo events again
ALTER TABLE public.demo_calendar ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can view demo events" ON public.demo_calendar;
CREATE POLICY "Anyone can view demo events"
  ON public.demo_calendar
  FOR SELECT
  TO public
  USING (true);
