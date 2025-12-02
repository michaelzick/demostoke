-- Setup pg_cron for nightly rental discovery agent
-- Run this SQL in your Supabase SQL editor

-- Enable extensions (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule nightly run at midnight Pacific Time (8 AM UTC)
SELECT cron.schedule(
    'nightly-rental-discovery',
    '0 8 * * *',  -- 8 AM UTC = midnight PT
    $$
    SELECT net.http_post(
        url := 'https://qtlhqsqanbxgfbcjigrl.supabase.co/functions/v1/rental-discovery-agent',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0bGhxc3FhbmJ4Z2ZiY2ppZ3JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyODg2MzUsImV4cCI6MjA2MTg2NDYzNX0.wTjmLkZPG2xo3eqwBo1jnLWsXxNmil_1-u_7ojTDY2g"}'::jsonb,
        body := '{"region": "los-angeles", "categories": ["ski", "snowboard"], "maxShops": 20}'::jsonb
    ) AS request_id;
    $$
);

-- Verify cron job was created
SELECT * FROM cron.job WHERE jobname = 'nightly-rental-discovery';

-- To manually trigger the agent (for testing):
-- SELECT net.http_post(
--     url := 'https://qtlhqsqanbxgfbcjigrl.supabase.co/functions/v1/rental-discovery-agent',
--     headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0bGhxc3FhbmJ4Z2ZiY2ppZ3JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyODg2MzUsImV4cCI6MjA2MTg2NDYzNX0.wTjmLkZPG2xo3eqwBo1jnLWsXxNmil_1-u_7ojTDY2g"}'::jsonb,
--     body := '{"region": "los-angeles", "categories": ["ski", "snowboard"], "maxShops": 5}'::jsonb
-- ) AS request_id;

-- To unschedule the job:
-- SELECT cron.unschedule('nightly-rental-discovery');

-- To view cron job history:
-- SELECT * FROM cron.job_run_details WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'nightly-rental-discovery') ORDER BY start_time DESC LIMIT 10;
