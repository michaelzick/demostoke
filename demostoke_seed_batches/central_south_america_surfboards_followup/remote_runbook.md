# Remote Runbook - Central and South America Surfboards Follow-Up

Status: applied to the linked DemoStoke Supabase project on 2026-06-07.

## Migration

- `supabase/migrations/20260607120000_seed_central_south_america_surfboards_followup.sql`

## Preflight

1. Confirm clean migration history:

```sh
supabase migration list --linked
```

Expected: local and remote aligned through `20260606120200`, with only `20260607120000` local-only before this follow-up is applied.

2. Run read-only duplicate checks:

```sh
supabase db query --linked --output json "
select au.email, pr.name, pr.address, count(e.id)::int as gear_count
from auth.users au
left join public.profiles pr on pr.id = au.id
left join public.equipment e on e.user_id = au.id
where lower(coalesce(pr.name, '')) in (lower('Nosara Surfboards'), lower('Sunzal Surf Company'))
   or au.email in ('michaelzick+nosarasurfboards@gmail.com','michaelzick+sunzalsurfcompany@gmail.com')
group by au.email, pr.name, pr.address
order by pr.name;
"
```

## Dry Run

Wrap the exact migration contents in:

```sql
BEGIN;
SET LOCAL lock_timeout = '10s';
SET LOCAL statement_timeout = '120s';
SELECT pg_advisory_xact_lock(20260607120000);
-- exact migration file contents here
-- assertions here
ROLLBACK;
```

Expected assertion targets:

- Nosara Surfboards profile exists in the transaction.
- Sunzal Surf Company has 36 surfboard rows in the transaction.
- Nosara Surfboards has 9 surfboard rows in the transaction.
- The 12 follow-up gear names exist with `currency_code = 'USD'`.
- Follow-up gear rows have two `equipment_images` rows each.

## Commit

Only after the rollback dry run passes, run the exact same SQL with `COMMIT`.

## Post-Commit

1. Run `validation.sql`.
2. Rerun the exact migration inside a rollback transaction to confirm idempotency.
3. Mark the migration applied in migration metadata:

```sh
supabase migration repair --linked --status applied 20260607120000
```

4. Confirm final alignment:

```sh
supabase migration list --linked
```

## Actual Apply Notes

- `psql` was not available in this environment, so the migration was executed with `supabase db query --linked --output json` using the exact local migration file contents inside explicit transactions.
- Rollback dry run completed with status `central_south_america_surfboards_followup_dry_run_complete`.
- Commit transaction completed with status `central_south_america_surfboards_followup_committed`.
- Post-commit validation confirmed Sunzal Surf Company has 36 surfboards and 72 images, and Nosara Surfboards has 9 surfboards and 18 images.
- Idempotency rollback rerun completed with status `central_south_america_surfboards_followup_idempotency_rollback_complete`.
- Migration metadata was repaired with `supabase migration repair --linked --status applied 20260607120000`.
