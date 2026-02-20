-- Demo Events discovery + approval pipeline

CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Add dedupe/source fields to published demo events
ALTER TABLE public.demo_calendar
  ADD COLUMN IF NOT EXISTS external_event_id text,
  ADD COLUMN IF NOT EXISTS source_primary_url text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_demo_calendar_external_event_id_unique
  ON public.demo_calendar (external_event_id)
  WHERE external_event_id IS NOT NULL;

-- Config singleton for discovery behavior + cron auth
CREATE TABLE IF NOT EXISTS public.demo_event_discovery_config (
  id boolean PRIMARY KEY DEFAULT true,
  enabled boolean NOT NULL DEFAULT true,
  cron_secret text NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  search_scope text NOT NULL DEFAULT 'us',
  window_months integer NOT NULL DEFAULT 6 CHECK (window_months > 0),
  max_candidates_per_run integer NOT NULL DEFAULT 50 CHECK (max_candidates_per_run > 0),
  last_cron_attempt_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT demo_event_discovery_config_singleton CHECK (id = true)
);

INSERT INTO public.demo_event_discovery_config (id)
VALUES (true)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.demo_event_discovery_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view demo event discovery config" ON public.demo_event_discovery_config;
CREATE POLICY "Admins can view demo event discovery config"
ON public.demo_event_discovery_config
FOR SELECT
USING (is_admin());

DROP POLICY IF EXISTS "Admins can update demo event discovery config" ON public.demo_event_discovery_config;
CREATE POLICY "Admins can update demo event discovery config"
ON public.demo_event_discovery_config
FOR UPDATE
USING (is_admin())
WITH CHECK (is_admin());

DROP TRIGGER IF EXISTS update_demo_event_discovery_config_updated_at ON public.demo_event_discovery_config;
CREATE TRIGGER update_demo_event_discovery_config_updated_at
BEFORE UPDATE ON public.demo_event_discovery_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Discovery candidates queue
CREATE TABLE IF NOT EXISTS public.demo_event_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_event_id text NOT NULL UNIQUE,

  title text NOT NULL,
  company text NOT NULL,
  gear_category text NOT NULL CHECK (gear_category IN ('snowboards', 'skis', 'surfboards', 'mountain-bikes')),
  event_date date NOT NULL,
  event_time time,
  location text NOT NULL,
  location_lat numeric,
  location_lng numeric,
  equipment_available text,

  thumbnail_url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),

  source_primary_url text NOT NULL,
  source_domain text,
  source_urls jsonb NOT NULL DEFAULT '[]'::jsonb,
  source_snippet text,
  raw_payload jsonb NOT NULL DEFAULT '{}'::jsonb,

  seen_count integer NOT NULL DEFAULT 1 CHECK (seen_count >= 1),
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  admin_edited boolean NOT NULL DEFAULT false,
  admin_edited_at timestamptz,
  admin_edited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,

  approved_at timestamptz,
  approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_demo_event_id uuid REFERENCES public.demo_calendar(id) ON DELETE SET NULL,
  rejected_at timestamptz,
  rejected_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  rejection_reason text,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_demo_event_candidates_status
  ON public.demo_event_candidates (status);
CREATE INDEX IF NOT EXISTS idx_demo_event_candidates_event_date
  ON public.demo_event_candidates (event_date);
CREATE INDEX IF NOT EXISTS idx_demo_event_candidates_last_seen_at
  ON public.demo_event_candidates (last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_demo_event_candidates_gear_category
  ON public.demo_event_candidates (gear_category);
CREATE INDEX IF NOT EXISTS idx_demo_event_candidates_source_domain
  ON public.demo_event_candidates (source_domain);

ALTER TABLE public.demo_event_candidates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view demo event candidates" ON public.demo_event_candidates;
CREATE POLICY "Admins can view demo event candidates"
ON public.demo_event_candidates
FOR SELECT
USING (is_admin());

DROP POLICY IF EXISTS "Admins can manage demo event candidates" ON public.demo_event_candidates;
CREATE POLICY "Admins can manage demo event candidates"
ON public.demo_event_candidates
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

DROP TRIGGER IF EXISTS update_demo_event_candidates_updated_at ON public.demo_event_candidates;
CREATE TRIGGER update_demo_event_candidates_updated_at
BEFORE UPDATE ON public.demo_event_candidates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Approve pending candidate into live demo calendar
CREATE OR REPLACE FUNCTION public.approve_demo_event_candidate(p_candidate_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth', 'pg_temp'
AS $function$
DECLARE
  v_candidate public.demo_event_candidates%ROWTYPE;
  v_existing_demo_id uuid;
  v_demo_event_id uuid;
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  SELECT *
  INTO v_candidate
  FROM public.demo_event_candidates
  WHERE id = p_candidate_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Demo event candidate not found';
  END IF;

  IF v_candidate.status <> 'pending' THEN
    RAISE EXCEPTION 'Only pending candidates can be approved';
  END IF;

  IF COALESCE(BTRIM(v_candidate.thumbnail_url), '') = '' THEN
    RAISE EXCEPTION 'Thumbnail URL is required before approval';
  END IF;

  SELECT id
  INTO v_existing_demo_id
  FROM public.demo_calendar
  WHERE external_event_id = v_candidate.external_event_id
  LIMIT 1;

  IF v_existing_demo_id IS NOT NULL THEN
    v_demo_event_id := v_existing_demo_id;
  ELSE
    INSERT INTO public.demo_calendar (
      title,
      company,
      gear_category,
      event_date,
      event_time,
      location,
      location_lat,
      location_lng,
      equipment_available,
      thumbnail_url,
      is_featured,
      created_by,
      external_event_id,
      source_primary_url
    ) VALUES (
      v_candidate.title,
      v_candidate.company,
      v_candidate.gear_category,
      v_candidate.event_date,
      v_candidate.event_time,
      v_candidate.location,
      v_candidate.location_lat,
      v_candidate.location_lng,
      v_candidate.equipment_available,
      v_candidate.thumbnail_url,
      false,
      auth.uid(),
      v_candidate.external_event_id,
      v_candidate.source_primary_url
    )
    ON CONFLICT (external_event_id) WHERE external_event_id IS NOT NULL
    DO UPDATE SET
      updated_at = now()
    RETURNING id INTO v_demo_event_id;
  END IF;

  UPDATE public.demo_event_candidates
  SET
    status = 'approved',
    approved_at = now(),
    approved_by = auth.uid(),
    approved_demo_event_id = v_demo_event_id,
    updated_at = now()
  WHERE id = p_candidate_id;

  RETURN v_demo_event_id;
END;
$function$;

-- Reject pending candidate and keep history
CREATE OR REPLACE FUNCTION public.reject_demo_event_candidate(
  p_candidate_id uuid,
  p_reason text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth', 'pg_temp'
AS $function$
DECLARE
  v_status text;
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  SELECT status
  INTO v_status
  FROM public.demo_event_candidates
  WHERE id = p_candidate_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Demo event candidate not found';
  END IF;

  IF v_status <> 'pending' THEN
    RAISE EXCEPTION 'Only pending candidates can be rejected';
  END IF;

  UPDATE public.demo_event_candidates
  SET
    status = 'rejected',
    rejected_at = now(),
    rejected_by = auth.uid(),
    rejection_reason = NULLIF(BTRIM(COALESCE(p_reason, '')), ''),
    updated_at = now()
  WHERE id = p_candidate_id;
END;
$function$;

REVOKE ALL ON FUNCTION public.approve_demo_event_candidate(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.approve_demo_event_candidate(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.reject_demo_event_candidate(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reject_demo_event_candidate(uuid, text) TO authenticated;

-- Cron trigger function (weekly schedule + PT 2am + 14-day gate)
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
      'reason', 'outside_2am_pt_window',
      'now_pt', to_char(v_now_pt, 'YYYY-MM-DD HH24:MI:SS')
    );
  END IF;

  IF v_config.last_cron_attempt_at IS NOT NULL
     AND v_now < (v_config.last_cron_attempt_at + interval '14 days') THEN
    RETURN jsonb_build_object(
      'status', 'skipped',
      'reason', 'within_14_day_cadence',
      'last_cron_attempt_at', v_config.last_cron_attempt_at
    );
  END IF;

  SELECT net.http_post(
    url := 'https://qtlhqsqanbxgfbcjigrl.supabase.co/functions/v1/discover-demo-events',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', v_config.cron_secret
    ),
    body := jsonb_build_object('source', 'cron')
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

-- Weekly dual-UTC schedule to preserve 2AM PT wall-clock through DST.
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
