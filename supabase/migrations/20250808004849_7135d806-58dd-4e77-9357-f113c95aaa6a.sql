-- 1) Add new columns to demo_calendar
ALTER TABLE public.demo_calendar
  ADD COLUMN IF NOT EXISTS thumbnail_url text,
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;

-- 2) Helpful index for quick featured queries
CREATE INDEX IF NOT EXISTS idx_demo_calendar_is_featured
  ON public.demo_calendar (is_featured);

-- 3) Tighten RLS for inserts to admin-only
DROP POLICY IF EXISTS "Authenticated users can create demo events" ON public.demo_calendar;

CREATE POLICY "Only admins can create demo events"
  ON public.demo_calendar
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'::app_role
    )
  );