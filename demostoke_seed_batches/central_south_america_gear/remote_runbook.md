# Remote Runbook - Central and South America Gear

Status: local pending. Do not apply to linked DemoStoke until a human explicitly approves remote execution.

## Migration Files

```text
supabase/migrations/20260606120000_seed_central_south_america_gear_shops.sql
supabase/migrations/20260606120100_seed_central_south_america_surfboards_gear.sql
supabase/migrations/20260606120200_seed_central_south_america_mountain_bikes_gear.sql
```

## Preconditions

- [ ] `psql` and Supabase CLI are available, or a real Postgres client fallback is prepared outside the repo.
- [ ] Either `SUPABASE_ACCESS_TOKEN` is configured for linked execution or `SUPABASE_DB_URL` is configured for direct `psql` execution.
- [ ] The live DemoStoke checkout is current and `supabase migration list --linked` shows no unexpected skipped, remote-only, or local-only versions beyond this batch.
- [ ] `demostoke_seed_batches/central_south_america_gear/validation.sql` is SELECT-only.
- [ ] Duplicate check returns no existing target shops.
- [ ] Human approved remote execution.
- [ ] Do not use `supabase db push`, `supabase db push --dry-run`, or `supabase migration up`.

## Static Safety Scan

```bash
rg -n "DELETE FROM|TRUNCATE|ALTER TABLE|ON CONFLICT|specs" supabase/migrations/20260606120*.sql
LC_ALL=C rg -n "[^[:ascii:]]" supabase/migrations/20260606120*.sql demostoke_seed_batches/central_south_america_gear
git diff --check
```

Expected: no destructive SQL matches other than no output, no non-ASCII matches, and no whitespace errors.

## Remote Dry Run

Use a real Postgres transaction client. This executes the exact files and rolls back.

```bash
psql "$SUPABASE_DB_URL" --set ON_ERROR_STOP=1 <<'SQL'
BEGIN;
SET LOCAL lock_timeout = '10s';
SET LOCAL statement_timeout = '120s';
SELECT pg_advisory_xact_lock(20260606120000);
\i /Users/michaelzick/Engineering/GitHub/demostoke/supabase/migrations/20260606120000_seed_central_south_america_gear_shops.sql
\i /Users/michaelzick/Engineering/GitHub/demostoke/supabase/migrations/20260606120100_seed_central_south_america_surfboards_gear.sql
\i /Users/michaelzick/Engineering/GitHub/demostoke/supabase/migrations/20260606120200_seed_central_south_america_mountain_bikes_gear.sql
\i /Users/michaelzick/Engineering/GitHub/demostoke/demostoke_seed_batches/central_south_america_gear/validation.sql
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
SELECT pg_advisory_xact_lock(20260606120000);
\i /Users/michaelzick/Engineering/GitHub/demostoke/supabase/migrations/20260606120000_seed_central_south_america_gear_shops.sql
\i /Users/michaelzick/Engineering/GitHub/demostoke/supabase/migrations/20260606120100_seed_central_south_america_surfboards_gear.sql
\i /Users/michaelzick/Engineering/GitHub/demostoke/supabase/migrations/20260606120200_seed_central_south_america_mountain_bikes_gear.sql
\i /Users/michaelzick/Engineering/GitHub/demostoke/demostoke_seed_batches/central_south_america_gear/validation.sql
COMMIT;
SQL
```

After commit, mark only these versions as applied:

```bash
supabase migration repair --linked --status applied 20260606120000 20260606120100 20260606120200
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
