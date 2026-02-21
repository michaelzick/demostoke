-- Ensure pgcrypto digest() is resolvable from the ingest RPC's restricted search_path.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER FUNCTION public.ingest_demo_event_candidates_json(jsonb)
SET search_path TO public, auth, extensions, pg_temp;
