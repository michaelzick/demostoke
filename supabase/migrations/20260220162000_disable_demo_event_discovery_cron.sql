-- Temporarily disable scheduled demo event discovery runs.
-- Cron job and trigger function remain installed; they will no-op while disabled.
INSERT INTO public.demo_event_discovery_config (id, enabled)
VALUES (true, false)
ON CONFLICT (id) DO UPDATE
SET enabled = EXCLUDED.enabled,
    updated_at = now();
