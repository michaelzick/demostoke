# Remote Validation Report - Central and South America Gear

Status: local pending. These migrations have not been applied to the linked DemoStoke Supabase project.

## Current State

- Migration files have been generated locally only.
- Hermes audit/reference files have been mirrored locally only.
- Read-only linked duplicate check returned `rows: []` for the selected shop names, seed emails, and website domains on 2026-06-06.
- `supabase migration list --linked` showed local and remote aligned through `20260602120000`, with only `20260606120000`, `20260606120100`, and `20260606120200` local-only for this batch.
- No remote dry run has been executed yet for this batch.
- No linked DB commit has been executed.
- No `supabase migration repair --linked` has been run for these versions.

## Planned Counts

| Shop | Category | Gear | Images |
| --- | --- | ---: | ---: |
| MTB Guatemala | mountain-bikes | 9 | 18 |
| Bike Arenal | mountain-bikes | 3 | 6 |
| Nosara MTB | mountain-bikes | 4 | 8 |
| Buen Camino Bike Park | mountain-bikes | 1 | 2 |
| Line Up Surf Shop | surfboards | 22 | 44 |
| Santa Catalina Surf Shop | surfboards | 2 | 4 |
| Sunzal Surf Company | surfboards | 33 | 66 |
| **Total** | | **74** | **148** |

## Required Before Remote Apply

- Run the duplicate query in `validation.sql` against linked DemoStoke and confirm the expected target rows do not already exist.
- Run a rollback dry run with the exact migration files.
- Confirm `validation.sql` remains SELECT-only.
- Get explicit human approval before committing the data-only batch.
