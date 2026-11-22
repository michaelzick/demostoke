-- Pause scheduled drafts while keeping manual generation available in Admin.
SELECT cron.alter_job(jobid, active := false)
FROM cron.job
WHERE jobname = 'gear-review-blog-generation-weekly-gate'
  AND active;
