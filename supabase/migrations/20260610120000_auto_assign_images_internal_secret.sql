-- Harden the new-equipment auto-image-assignment trigger.
--
-- The auto-assign-gear-images edge function previously had no authentication
-- and ran with the service-role key, so any anonymous caller could write
-- equipment_images and burn the Google image-search quota. The function now
-- requires either an admin JWT or a shared internal secret. This trigger is the
-- internal caller, so it must present that secret on the pg_net request.
--
-- Deployment notes (NOT auto-applied):
--   1. Set a DB-level secret that this trigger reads:
--        ALTER DATABASE postgres
--          SET app.auto_assign_internal_secret = '<random-secret>';
--      (or store it in Vault and read it here instead).
--   2. Set the matching edge-function secret:
--        supabase secrets set AUTO_ASSIGN_INTERNAL_SECRET=<same-random-secret>
--   3. Deploy the updated auto-assign-gear-images function.
-- Apply all three together, otherwise auto-assignment will 401.

CREATE OR REPLACE FUNCTION public.notify_new_equipment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  supabase_url text;
  internal_secret text;
BEGIN
  supabase_url := 'https://qtlhqsqanbxgfbcjigrl.supabase.co';
  internal_secret := current_setting('app.auto_assign_internal_secret', true);

  PERFORM net.http_post(
    url := supabase_url || '/functions/v1/auto-assign-gear-images',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-internal-secret', coalesce(internal_secret, '')
    ),
    body := jsonb_build_object(
      'equipment_id', NEW.id,
      'equipment_name', NEW.name,
      'category', NEW.category
    )
  );

  RETURN NEW;
END;
$$;
