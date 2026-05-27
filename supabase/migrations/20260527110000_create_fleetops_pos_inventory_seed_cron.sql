CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE TABLE IF NOT EXISTS public.fleetops_pos_inventory_seed_config (
  id boolean PRIMARY KEY DEFAULT true CHECK (id = true),
  enabled boolean NOT NULL DEFAULT true,
  fleetops_function_url text NOT NULL DEFAULT 'https://imdhbnfgrrckwoboodox.supabase.co/functions/v1/seed-pos-inventory',
  cron_secret text NOT NULL DEFAULT encode(extensions.gen_random_bytes(32), 'hex'),
  last_cron_attempt_at timestamp with time zone,
  last_request_id bigint,
  last_queued_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.fleetops_pos_inventory_seed_config ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.fleetops_pos_inventory_seed_config TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fleetops_pos_inventory_seed_config TO service_role;

DROP POLICY IF EXISTS "Admins can view fleetops pos inventory seed config"
ON public.fleetops_pos_inventory_seed_config;
DROP POLICY IF EXISTS "Admins can manage fleetops pos inventory seed config"
ON public.fleetops_pos_inventory_seed_config;

CREATE POLICY "Admins can view fleetops pos inventory seed config"
ON public.fleetops_pos_inventory_seed_config
FOR SELECT
USING (is_admin());

CREATE POLICY "Admins can manage fleetops pos inventory seed config"
ON public.fleetops_pos_inventory_seed_config
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

DROP TRIGGER IF EXISTS update_fleetops_pos_inventory_seed_config_updated_at
ON public.fleetops_pos_inventory_seed_config;

CREATE TRIGGER update_fleetops_pos_inventory_seed_config_updated_at
BEFORE UPDATE ON public.fleetops_pos_inventory_seed_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.fleetops_pos_inventory_seed_config (id)
VALUES (true)
ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.trigger_fleetops_pos_inventory_seed_cron(
  p_force boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_config public.fleetops_pos_inventory_seed_config%ROWTYPE;
  v_now timestamp with time zone := now();
  v_now_pt timestamp := timezone('America/Los_Angeles', v_now);
  v_request_id bigint;
  v_source text := CASE WHEN p_force THEN 'manual' ELSE 'cron' END;
BEGIN
  SELECT *
  INTO v_config
  FROM public.fleetops_pos_inventory_seed_config
  WHERE id = true;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'skipped', 'reason', 'missing_config');
  END IF;

  IF NOT v_config.enabled THEN
    RETURN jsonb_build_object('status', 'skipped', 'reason', 'disabled');
  END IF;

  IF NOT p_force AND EXTRACT(HOUR FROM v_now_pt) <> 2 THEN
    RETURN jsonb_build_object(
      'status', 'skipped',
      'reason', 'outside_2am_pt_window',
      'now_pt', to_char(v_now_pt, 'YYYY-MM-DD HH24:MI:SS')
    );
  END IF;

  IF NOT p_force
    AND v_config.last_queued_at IS NOT NULL
    AND v_now < v_config.last_queued_at + interval '2 days'
  THEN
    RETURN jsonb_build_object(
      'status', 'skipped',
      'reason', 'cadence_not_elapsed',
      'last_queued_at', v_config.last_queued_at,
      'next_eligible_at', v_config.last_queued_at + interval '2 days'
    );
  END IF;

  SELECT net.http_post(
    url := v_config.fleetops_function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', v_config.cron_secret
    ),
    body := jsonb_build_object(
      'source', v_source,
      'force', p_force
    ),
    timeout_milliseconds := 120000
  )
  INTO v_request_id;

  UPDATE public.fleetops_pos_inventory_seed_config
  SET
    last_cron_attempt_at = v_now,
    last_request_id = v_request_id,
    last_queued_at = v_now,
    updated_at = v_now
  WHERE id = true;

  RETURN jsonb_build_object(
    'status', 'queued',
    'source', v_source,
    'request_id', v_request_id,
    'attempted_at', v_now,
    'fleetops_function_url', v_config.fleetops_function_url
  );
END;
$function$;

REVOKE ALL ON FUNCTION public.trigger_fleetops_pos_inventory_seed_cron(boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.trigger_fleetops_pos_inventory_seed_cron(boolean) TO postgres;
GRANT EXECUTE ON FUNCTION public.trigger_fleetops_pos_inventory_seed_cron(boolean) TO service_role;

DO $$
DECLARE
  v_job_id bigint;
BEGIN
  SELECT jobid
  INTO v_job_id
  FROM cron.job
  WHERE jobname = 'fleetops-pos-inventory-seed-2am-pt'
  LIMIT 1;

  IF v_job_id IS NOT NULL THEN
    PERFORM cron.unschedule(v_job_id);
  END IF;

  PERFORM cron.schedule(
    'fleetops-pos-inventory-seed-2am-pt',
    '0 9,10 * * *',
    'SELECT public.trigger_fleetops_pos_inventory_seed_cron();'
  );
END;
$$;
