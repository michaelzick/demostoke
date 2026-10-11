-- Weekly demo event discovery that auto-publishes into the public demo calendar.
-- Re-enables the discovery cron (disabled in 20260220162000), moves it from a
-- 14-day to a weekly cadence, and lets discover-demo-events insert validated
-- events into demo_calendar without the admin approval step.

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

ALTER TABLE public.demo_event_discovery_config
  ADD COLUMN IF NOT EXISTS auto_publish boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS publish_owner_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS last_success_at timestamptz;

-- demo_calendar.created_by is NOT NULL, so auto-published rows are owned by an admin account.
INSERT INTO public.demo_event_discovery_config (id, publish_owner_user_id)
VALUES (
  true,
  (
    SELECT user_id
    FROM public.user_roles
    WHERE role = 'admin'
    ORDER BY assigned_at NULLS LAST
    LIMIT 1
  )
)
ON CONFLICT (id) DO UPDATE
SET
  publish_owner_user_id = COALESCE(
    public.demo_event_discovery_config.publish_owner_user_id,
    EXCLUDED.publish_owner_user_id
  ),
  updated_at = now();

UPDATE public.demo_event_discovery_config
SET
  enabled = true,
  window_months = 6,
  updated_at = now()
WHERE id = true;

-- Weekly gate: Sunday 2am PT. The 6-day cadence check dedupes the two UTC
-- firings that keep the 2am PT wall clock across DST.
CREATE OR REPLACE FUNCTION public.trigger_demo_event_discovery_cron()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_config public.demo_event_discovery_config%ROWTYPE;
  v_now timestamptz := now();
  v_now_pt timestamp := timezone('America/Los_Angeles', v_now);
  v_request_id bigint;
BEGIN
  SELECT *
  INTO v_config
  FROM public.demo_event_discovery_config
  WHERE id = true;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'skipped', 'reason', 'missing_config');
  END IF;

  IF NOT v_config.enabled THEN
    RETURN jsonb_build_object('status', 'skipped', 'reason', 'disabled');
  END IF;

  IF EXTRACT(DOW FROM v_now_pt) <> 0 OR EXTRACT(HOUR FROM v_now_pt) <> 2 THEN
    RETURN jsonb_build_object(
      'status', 'skipped',
      'reason', 'outside_sunday_2am_pt_window',
      'now_pt', to_char(v_now_pt, 'YYYY-MM-DD HH24:MI:SS')
    );
  END IF;

  IF v_config.last_cron_attempt_at IS NOT NULL
     AND v_now < (v_config.last_cron_attempt_at + interval '6 days') THEN
    RETURN jsonb_build_object(
      'status', 'skipped',
      'reason', 'within_weekly_cadence',
      'last_cron_attempt_at', v_config.last_cron_attempt_at
    );
  END IF;

  SELECT net.http_post(
    url := 'https://qtlhqsqanbxgfbcjigrl.supabase.co/functions/v1/discover-demo-events',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', v_config.cron_secret
    ),
    body := jsonb_build_object('source', 'cron'),
    timeout_milliseconds := 150000
  )
  INTO v_request_id;

  UPDATE public.demo_event_discovery_config
  SET
    last_cron_attempt_at = v_now,
    updated_at = v_now
  WHERE id = true;

  RETURN jsonb_build_object(
    'status', 'queued',
    'request_id', v_request_id,
    'attempted_at', v_now
  );
END;
$function$;

REVOKE ALL ON FUNCTION public.trigger_demo_event_discovery_cron() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.trigger_demo_event_discovery_cron() TO postgres;

DO $$
DECLARE
  v_job_id bigint;
BEGIN
  SELECT jobid
  INTO v_job_id
  FROM cron.job
  WHERE jobname = 'demo-event-discovery-weekly-gate'
  LIMIT 1;

  IF v_job_id IS NOT NULL THEN
    PERFORM cron.unschedule(v_job_id);
  END IF;

  PERFORM cron.schedule(
    'demo-event-discovery-weekly-gate',
    '0 9,10 * * 0',
    'SELECT public.trigger_demo_event_discovery_cron();'
  );
END;
$$;
