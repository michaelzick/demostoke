# Remote Validation Report - North America Coverage Fill

Status: applied to the linked DemoStoke Supabase project on 2026-06-01.

## Apply Sequence

- Preflight duplicate check against linked `public.profiles`, `auth.users`, and `public.equipment`: `rows: []`.
- `supabase migration list --linked` before apply showed versions `20260601120000` through `20260601120400` as local-only.
- Rollback dry run with the generated migration files completed with status `north_america_coverage_fill_exact_dry_run_complete`.
- Commit transaction completed with status `north_america_coverage_fill_committed`.
- In-transaction assertions passed before `COMMIT`.
- Read-only validation after commit returned all expected shops, all expected gear counts, and two images per gear row.
- Idempotency rollback rerun completed with status `north_america_coverage_fill_idempotency_rollback_complete`.
- Migration metadata repaired with `supabase migration repair --linked --status applied 20260601120000 20260601120100 20260601120200 20260601120300 20260601120400`.
- Final `supabase migration list --linked` showed all five versions aligned local and remote.

## Final Applied Counts

| Shop | Category | Gear | Images |
| --- | --- | ---: | ---: |
| Surf Mexico | surfboards | 8 | 16 |
| BikeFlow Oaxaca | mountain-bikes | 5 | 10 |
| Bike Denali | mountain-bikes | 1 | 2 |
| Dismount Bike Shop | mountain-bikes | 3 | 6 |
| Willi's Ski and Board Seven Springs | skis | 10 | 20 |
| Tactics Bend | snowboards | 10 | 20 |
| **Total** | | **37** | **74** |
