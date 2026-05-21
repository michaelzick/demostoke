# Supabase Migration Reconciliation

The linked project for this repo is DemoStoke (`qtlhqsqanbxgfbcjigrl`). As of May 21, 2026, the linked database schema and app data reflect the current DemoStoke app state, but `supabase_migrations.schema_migrations` only records legacy `001` through `011` entries that do not describe the live schema.

Keep `supabase/migrations/` limited to migration files that match Supabase CLI's `<timestamp>_name.sql` pattern. Non-migration docs inside that directory are reported as skipped migrations by `supabase migration list`.

## Current Policy

- Treat local migration SQL as repository provenance for schema and data changes.
- Do not run `supabase db push` while linked migration metadata is stale.
- Do not run `supabase migration repair --linked` unless the user explicitly approves remote metadata repair.
- Do not apply local migrations to the linked database just because they appear local-only in `supabase migration list`; verify the linked schema/data first.
- Data-only seed applies must remain explicit and rollback-first: validate in a real transaction, roll back, then commit only after approval or an already-approved apply step.

## If Remote Metadata Repair Is Approved

Repair migration metadata only. Do not change application tables or seed data as part of metadata repair.

Generate version lists from filenames instead of typing them by hand:

```sh
supabase migration repair --linked --status reverted 001 002 003 004 005 006 007 008 009 010 011

supabase migration repair --linked --status applied $(
  find supabase/migrations -maxdepth 1 -type f -name '*.sql' \
    -exec basename {} \; \
    | sed -nE 's/^([0-9]{14})_.*/\1/p' \
    | sort
)
```

After repair, run `supabase migration list --linked` and confirm there are no skipped filenames and no unexpected local-only or remote-only versions before using migration-history-driven commands again.
