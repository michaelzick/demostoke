-- Promptfoo red team run persistence for admin security dashboard

CREATE TABLE IF NOT EXISTS public.security_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requested_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  trigger_source text NOT NULL DEFAULT 'push' CHECK (trigger_source IN ('push', 'manual', 'admin')),
  suite text NOT NULL DEFAULT 'smoke' CHECK (suite IN ('smoke', 'full')),
  branch text,
  environment text,
  commit_sha text,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'passed', 'failed', 'errored', 'cancelled')),
  github_run_id bigint,
  github_run_attempt integer,
  github_run_number integer,
  github_repository text,
  github_workflow text,
  github_run_url text,
  promptfoo_version text,
  promptfoo_results_path text,
  promptfoo_report_path text,
  total_findings integer NOT NULL DEFAULT 0 CHECK (total_findings >= 0),
  critical_count integer NOT NULL DEFAULT 0 CHECK (critical_count >= 0),
  high_count integer NOT NULL DEFAULT 0 CHECK (high_count >= 0),
  medium_count integer NOT NULL DEFAULT 0 CHECK (medium_count >= 0),
  low_count integer NOT NULL DEFAULT 0 CHECK (low_count >= 0),
  informational_count integer NOT NULL DEFAULT 0 CHECK (informational_count >= 0),
  summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  inputs jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_security_runs_github_run_id
  ON public.security_runs (github_run_id)
  WHERE github_run_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_security_runs_status_created_at
  ON public.security_runs (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_security_runs_branch_created_at
  ON public.security_runs (branch, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_security_runs_suite_created_at
  ON public.security_runs (suite, created_at DESC);

ALTER TABLE public.security_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read security runs" ON public.security_runs;
CREATE POLICY "Admins can read security runs"
ON public.security_runs
FOR SELECT
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update security runs" ON public.security_runs;
CREATE POLICY "Admins can update security runs"
ON public.security_runs
FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP TRIGGER IF EXISTS update_security_runs_updated_at ON public.security_runs;
CREATE TRIGGER update_security_runs_updated_at
BEFORE UPDATE ON public.security_runs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.security_findings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES public.security_runs(id) ON DELETE CASCADE,
  fingerprint text NOT NULL,
  plugin_id text,
  plugin_label text,
  severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('critical', 'high', 'medium', 'low', 'informational')),
  target_id text,
  target_label text,
  provider_id text,
  provider_label text,
  category text,
  vulnerability_type text,
  test_id text,
  test_description text,
  prompt_excerpt text,
  response_excerpt text,
  score numeric,
  passed boolean,
  labels text[] NOT NULL DEFAULT '{}'::text[],
  triage_status text NOT NULL DEFAULT 'open' CHECK (triage_status IN ('open', 'investigating', 'resolved', 'accepted', 'false_positive')),
  triaged_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  triaged_at timestamptz,
  resolution_notes text,
  branch text,
  commit_sha text,
  raw jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_security_findings_run_fingerprint
  ON public.security_findings (run_id, fingerprint);

CREATE INDEX IF NOT EXISTS idx_security_findings_run_severity
  ON public.security_findings (run_id, severity);

CREATE INDEX IF NOT EXISTS idx_security_findings_triage_status
  ON public.security_findings (triage_status, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_security_findings_target_id
  ON public.security_findings (target_id);

CREATE INDEX IF NOT EXISTS idx_security_findings_plugin_id
  ON public.security_findings (plugin_id);

ALTER TABLE public.security_findings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read security findings" ON public.security_findings;
CREATE POLICY "Admins can read security findings"
ON public.security_findings
FOR SELECT
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update security findings" ON public.security_findings;
CREATE POLICY "Admins can update security findings"
ON public.security_findings
FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP TRIGGER IF EXISTS update_security_findings_updated_at ON public.security_findings;
CREATE TRIGGER update_security_findings_updated_at
BEFORE UPDATE ON public.security_findings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
