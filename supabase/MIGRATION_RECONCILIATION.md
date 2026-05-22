# Supabase Migration Reconciliation

The linked project for this repo is DemoStoke (`qtlhqsqanbxgfbcjigrl`). On May 21, 2026, linked migration metadata was repaired to match the repository's timestamped migration history.

Before repair, the linked database schema and app data already reflected the current DemoStoke app state, but `supabase_migrations.schema_migrations` only recorded legacy `001` through `011` entries that did not describe the live schema. Those legacy entries were marked reverted, and the timestamped local migrations through `20260520010000` were marked applied.

Already-applied Hermes seed migrations were later reconciled in two follow-up passes:

- Texas mountain-bike seed migrations were copied into this repo from the Hermes DemoStoke migration pack and marked applied in metadata.
- Final-state Park City/Jans/White Pine, Arizona, Oregon, Colorado, and Ventura County seed migrations were copied into this repo from the same Hermes pack and marked applied in metadata.

The linked migration history now has 240 timestamped entries and is aligned through `20260520232100`. The highest version did not change during the older Hermes seed reconciliation because the copied batches predate the Texas seed versions.

Keep `supabase/migrations/` limited to migration files that match Supabase CLI's `<timestamp>_name.sql` pattern. Non-migration docs inside that directory are reported as skipped migrations by `supabase migration list`.

## Current Policy

- Treat local migration SQL as repository provenance for schema and data changes.
- Run `supabase migration list --linked` before migration-history-driven commands. It should show local and remote aligned through `20260520232100`, with only intentionally new migrations local-only.
- Future schema migrations may use the normal Supabase workflow only when migration history is aligned and the local-only entries are the intended new migrations.
- If historical drift reappears, do not apply local migrations to the linked database just because they appear local-only in `supabase migration list`; verify the linked schema/data first.
- Data-only seed applies must remain explicit and rollback-first: validate in a real transaction, roll back, then commit only after approval or an already-approved apply step.
- Do not re-import the intentionally excluded Hermes-only files: `20260511120100_seed_park_city_utah_gear.sql`, `20260512100100_seed_jans_mountain_outfitters_gear.sql`, or `20260512130100_seed_arizona_mountain_bikes_gear.sql`.

## Historical Repair Command

The May 21, 2026 repair changed migration metadata only. It did not change application tables or seed data. Version lists were generated from filenames instead of typed by hand:

```sh
supabase migration repair --linked --status reverted 001 002 003 004 005 006 007 008 009 010 011

supabase migration repair --linked --status applied $(
  find supabase/migrations -maxdepth 1 -type f -name '*.sql' \
    -exec basename {} \; \
    | sed -nE 's/^([0-9]{14})_.*/\1/p' \
    | sort
)
```

After any future repair, run `supabase migration list --linked` and confirm there are no skipped filenames and no unexpected local-only or remote-only versions before using migration-history-driven commands again.

## Follow-up Hermes Seed Repair

The same May 21, 2026 cleanup repaired metadata for already-applied Hermes seed data without changing app tables. The imported files were first compared byte-for-byte against the Hermes migration pack.

The following Hermes-only files were excluded:

- `20260511120100_seed_park_city_utah_gear.sql` because it represents an old package/Park City Sport gear state that is not present in linked data.
- `20260512100100_seed_jans_mountain_outfitters_gear.sql` because it is the old Jans package seed replaced by `20260512110000_replace_jans_gear_granular.sql`.
- `20260512130100_seed_arizona_mountain_bikes_gear.sql` because it is an explicit superseded stub with a duplicate timestamp.

The metadata-only repair command for the imported Hermes versions was:

```sh
supabase migration repair --linked --status applied \
  20260511120000 \
  20260512100000 \
  20260512110000 \
  20260512120000 \
  20260512130000 \
  20260512130100 \
  20260512130200 \
  20260512130300 \
  20260512130400 \
  20260513130000 \
  20260515180000 \
  20260515180100 \
  20260519000200 \
  20260519000300 \
  20260519000400 \
  20260519000500 \
  20260519213202 \
  20260519213302
```
