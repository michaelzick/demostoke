CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE TABLE IF NOT EXISTS public.gear_review_blog_generation_config (
  id boolean PRIMARY KEY DEFAULT true CHECK (id = true),
  enabled boolean NOT NULL DEFAULT true,
  cron_secret text NOT NULL DEFAULT encode(extensions.gen_random_bytes(32), 'hex'),
  draft_owner_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  last_cron_attempt_at timestamp with time zone,
  last_success_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.gear_review_blog_generation_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id uuid REFERENCES public.equipment(id) ON DELETE SET NULL,
  blog_post_id uuid REFERENCES public.blog_posts(id) ON DELETE SET NULL,
  gear_category text,
  source text NOT NULL CHECK (source IN ('cron', 'manual')),
  status text NOT NULL CHECK (status IN ('success', 'skipped', 'error')),
  reason text,
  error_message text,
  hidden_evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_gear_review_blog_generation_success_equipment
ON public.gear_review_blog_generation_runs(equipment_id)
WHERE status = 'success' AND equipment_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_gear_review_blog_generation_runs_blog_post
ON public.gear_review_blog_generation_runs(blog_post_id)
WHERE blog_post_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_gear_review_blog_generation_runs_status_created
ON public.gear_review_blog_generation_runs(status, created_at DESC);

ALTER TABLE public.gear_review_blog_generation_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gear_review_blog_generation_runs ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.gear_review_blog_generation_config TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gear_review_blog_generation_config TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gear_review_blog_generation_runs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gear_review_blog_generation_runs TO service_role;

DROP POLICY IF EXISTS "Admins can view gear review blog generation config" ON public.gear_review_blog_generation_config;
DROP POLICY IF EXISTS "Admins can manage gear review blog generation config" ON public.gear_review_blog_generation_config;
DROP POLICY IF EXISTS "Admins can view gear review blog generation runs" ON public.gear_review_blog_generation_runs;
DROP POLICY IF EXISTS "Admins can manage gear review blog generation runs" ON public.gear_review_blog_generation_runs;

CREATE POLICY "Admins can view gear review blog generation config"
ON public.gear_review_blog_generation_config
FOR SELECT
USING (is_admin());

CREATE POLICY "Admins can manage gear review blog generation config"
ON public.gear_review_blog_generation_config
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Admins can view gear review blog generation runs"
ON public.gear_review_blog_generation_runs
FOR SELECT
USING (is_admin());

CREATE POLICY "Admins can manage gear review blog generation runs"
ON public.gear_review_blog_generation_runs
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

DROP TRIGGER IF EXISTS update_gear_review_blog_generation_config_updated_at
ON public.gear_review_blog_generation_config;

CREATE TRIGGER update_gear_review_blog_generation_config_updated_at
BEFORE UPDATE ON public.gear_review_blog_generation_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_gear_review_blog_generation_runs_updated_at
ON public.gear_review_blog_generation_runs;

CREATE TRIGGER update_gear_review_blog_generation_runs_updated_at
BEFORE UPDATE ON public.gear_review_blog_generation_runs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.get_public_generated_gear_review_metadata(p_blog_post_ids uuid[])
RETURNS TABLE(blog_post_id uuid, equipment_id uuid, gear_category text)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT
    runs.blog_post_id,
    runs.equipment_id,
    runs.gear_category
  FROM public.gear_review_blog_generation_runs AS runs
  INNER JOIN public.blog_posts AS posts
    ON posts.id = runs.blog_post_id
  WHERE runs.status = 'success'
    AND runs.blog_post_id = ANY(p_blog_post_ids)
    AND (
      posts.status = 'published'
      OR posts.user_id = auth.uid()
      OR is_admin()
    );
$function$;

REVOKE ALL ON FUNCTION public.get_public_generated_gear_review_metadata(uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_generated_gear_review_metadata(uuid[]) TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_generated_gear_review_metadata(uuid[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_generated_gear_review_metadata(uuid[]) TO service_role;

INSERT INTO public.gear_review_blog_generation_config (id, draft_owner_user_id)
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
  draft_owner_user_id = COALESCE(
    public.gear_review_blog_generation_config.draft_owner_user_id,
    EXCLUDED.draft_owner_user_id
  ),
  updated_at = now();

CREATE OR REPLACE FUNCTION public.trigger_gear_review_blog_generation_cron()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_config public.gear_review_blog_generation_config%ROWTYPE;
  v_now timestamp with time zone := now();
  v_now_pt timestamp := timezone('America/Los_Angeles', v_now);
  v_request_id bigint;
BEGIN
  SELECT *
  INTO v_config
  FROM public.gear_review_blog_generation_config
  WHERE id = true;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'skipped', 'reason', 'missing_config');
  END IF;

  IF NOT v_config.enabled THEN
    RETURN jsonb_build_object('status', 'skipped', 'reason', 'disabled');
  END IF;

  IF EXTRACT(DOW FROM v_now_pt) <> 6 OR EXTRACT(HOUR FROM v_now_pt) <> 10 THEN
    RETURN jsonb_build_object(
      'status', 'skipped',
      'reason', 'outside_saturday_10am_pt_window',
      'now_pt', to_char(v_now_pt, 'YYYY-MM-DD HH24:MI:SS')
    );
  END IF;

  SELECT net.http_post(
    url := 'https://qtlhqsqanbxgfbcjigrl.supabase.co/functions/v1/generate-gear-review-blog-draft',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', v_config.cron_secret
    ),
    body := jsonb_build_object('source', 'cron'),
    timeout_milliseconds := 120000
  )
  INTO v_request_id;

  UPDATE public.gear_review_blog_generation_config
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

REVOKE ALL ON FUNCTION public.trigger_gear_review_blog_generation_cron() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.trigger_gear_review_blog_generation_cron() TO postgres;

DO $$
DECLARE
  v_job_id bigint;
BEGIN
  SELECT jobid
  INTO v_job_id
  FROM cron.job
  WHERE jobname = 'gear-review-blog-generation-weekly-gate'
  LIMIT 1;

  IF v_job_id IS NOT NULL THEN
    PERFORM cron.unschedule(v_job_id);
  END IF;

  PERFORM cron.schedule(
    'gear-review-blog-generation-weekly-gate',
    '0 17,18 * * 6',
    'SELECT public.trigger_gear_review_blog_generation_cron();'
  );
END;
$$;
