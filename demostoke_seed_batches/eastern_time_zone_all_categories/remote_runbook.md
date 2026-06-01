# Remote Runbook - Eastern Time Zone All Categories

Status: local preparation only. Do not run these commands until the user explicitly approves remote execution.

## Migration Files

```text
supabase/migrations/20260530120000_seed_eastern_time_zone_all_categories_shops.sql
supabase/migrations/20260530120100_seed_eastern_time_zone_surfboards_gear.sql
supabase/migrations/20260530120200_seed_eastern_time_zone_skis_gear.sql
supabase/migrations/20260530120300_seed_eastern_time_zone_snowboards_gear.sql
supabase/migrations/20260530120400_seed_eastern_time_zone_mountain_bikes_gear.sql
```

## Preconditions

- [ ] `psql` and Supabase CLI are available, or a real Postgres client fallback is prepared outside the repo.
- [ ] Either `SUPABASE_ACCESS_TOKEN` is configured for linked execution or `SUPABASE_DB_URL` is configured for direct `psql` execution.
- [ ] The live DemoStoke checkout is current and `supabase migration list --linked` shows no unexpected skipped, remote-only, or local-only versions.
- [ ] `demostoke_seed_batches/eastern_time_zone_all_categories/validation.sql` is SELECT-only.
- [ ] Human approved remote execution.
- [ ] Do not use `supabase db push`, `supabase db push --dry-run`, or `supabase migration up`.

## Static Safety Scan

```bash
rg -n "DELETE FROM|TRUNCATE|DROP|ALTER TABLE|ON CONFLICT|specs" supabase/migrations/20260530120*.sql
LC_ALL=C rg -n "[^[:ascii:]]" supabase/migrations/20260530120*.sql
git diff --check
```

Expected: no matches from the first two commands and no whitespace errors.

## Remote Dry Run

Use a real Postgres transaction client. This executes the exact files and rolls back.

```bash
psql "$SUPABASE_DB_URL" --set ON_ERROR_STOP=1 <<'SQL'
BEGIN;
SET LOCAL lock_timeout = '10s';
SET LOCAL statement_timeout = '120s';
SELECT pg_advisory_xact_lock(20260530120000);
\i /Users/michaelzick/Engineering/GitHub/demostoke/supabase/migrations/20260530120000_seed_eastern_time_zone_all_categories_shops.sql
\i /Users/michaelzick/Engineering/GitHub/demostoke/supabase/migrations/20260530120100_seed_eastern_time_zone_surfboards_gear.sql
\i /Users/michaelzick/Engineering/GitHub/demostoke/supabase/migrations/20260530120200_seed_eastern_time_zone_skis_gear.sql
\i /Users/michaelzick/Engineering/GitHub/demostoke/supabase/migrations/20260530120300_seed_eastern_time_zone_snowboards_gear.sql
\i /Users/michaelzick/Engineering/GitHub/demostoke/supabase/migrations/20260530120400_seed_eastern_time_zone_mountain_bikes_gear.sql
\i /Users/michaelzick/Engineering/GitHub/demostoke/demostoke_seed_batches/eastern_time_zone_all_categories/validation.sql
ROLLBACK;
SQL
```

## Remote Execution

Only after the dry run passes and the user approves:

```bash
psql "$SUPABASE_DB_URL" --set ON_ERROR_STOP=1 <<'SQL'
BEGIN;
SET LOCAL lock_timeout = '10s';
SET LOCAL statement_timeout = '120s';
SELECT pg_advisory_xact_lock(20260530120000);
\i /Users/michaelzick/Engineering/GitHub/demostoke/supabase/migrations/20260530120000_seed_eastern_time_zone_all_categories_shops.sql
\i /Users/michaelzick/Engineering/GitHub/demostoke/supabase/migrations/20260530120100_seed_eastern_time_zone_surfboards_gear.sql
\i /Users/michaelzick/Engineering/GitHub/demostoke/supabase/migrations/20260530120200_seed_eastern_time_zone_skis_gear.sql
\i /Users/michaelzick/Engineering/GitHub/demostoke/supabase/migrations/20260530120300_seed_eastern_time_zone_snowboards_gear.sql
\i /Users/michaelzick/Engineering/GitHub/demostoke/supabase/migrations/20260530120400_seed_eastern_time_zone_mountain_bikes_gear.sql
\i /Users/michaelzick/Engineering/GitHub/demostoke/demostoke_seed_batches/eastern_time_zone_all_categories/validation.sql
COMMIT;
SQL
```

After commit, mark only the applied versions as applied:

```bash
supabase migration repair --linked --status applied 20260530120000 20260530120100 20260530120200 20260530120300 20260530120400
supabase migration list --linked
```

## Post-Run Checks

- [ ] Expected shops appear in `public.profiles`.
- [ ] Expected roles appear in `public.user_roles`.
- [ ] Expected gear appears in `public.equipment`.
- [ ] Each new equipment row has exactly two images.
- [ ] Gear appears with the correct shop lat/lng.
- [ ] `validation.sql` was rerun read-only after commit.
- [ ] A second rollback transaction proved idempotency and inserted zero new gear/images.
- [ ] Migration history is aligned after repair.
