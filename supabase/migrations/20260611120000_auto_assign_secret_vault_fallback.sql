-- Read the auto-assign internal secret from Vault instead of a database GUC.
--
-- Migration 20260610120000 had notify_new_equipment() read the shared secret
-- from current_setting('app.auto_assign_internal_secret'), with deployment
-- notes saying to persist it via ALTER DATABASE ... SET. That is not possible
-- on Supabase managed Postgres: persisting custom parameters requires
-- superuser (PG15 parameter ACLs), and both ALTER DATABASE and ALTER ROLE
-- variants fail with "permission denied to set parameter". Vault is the
-- supported alternative the original migration anticipated.
--
-- Runtime prerequisite (run once, never commit the value):
--   SELECT vault.create_secret('<value>', 'auto_assign_internal_secret',
--     'Shared secret for the auto-assign-gear-images edge function');
-- with the same value as the AUTO_ASSIGN_INTERNAL_SECRET function secret.
-- The GUC remains a fallback for environments where it can be set.

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

  -- Never let secret lookup break equipment inserts; a missing secret only
  -- means the auto-assign call gets rejected by the edge function.
  BEGIN
    SELECT decrypted_secret INTO internal_secret
    FROM vault.decrypted_secrets
    WHERE name = 'auto_assign_internal_secret'
    ORDER BY created_at DESC
    LIMIT 1;
  EXCEPTION WHEN OTHERS THEN
    internal_secret := NULL;
  END;

  IF internal_secret IS NULL OR internal_secret = '' THEN
    internal_secret := current_setting('app.auto_assign_internal_secret', true);
  END IF;

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
