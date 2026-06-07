# Remote Validation Report - Central and South America Gear

Status: applied to the linked DemoStoke Supabase project on 2026-06-07.

## Apply Sequence

- Preflight static safety scan found no destructive patterns in executable migration SQL.
- `supabase migration list --linked` before apply showed local and remote aligned through `20260602120000`, with only `20260606120000`, `20260606120100`, and `20260606120200` local-only for this batch.
- Read-only linked duplicate check returned `rows: []` for the selected shop names, seed emails, and website domains.
- Rollback dry run with the exact migration files completed with status `central_south_america_exact_dry_run_complete`.
- Commit transaction completed with status `central_south_america_committed`.
- In-transaction assertions passed before `COMMIT`.
- Read-only validation after commit returned all expected shops, all expected gear counts, and two images per gear row.
- Idempotency rollback rerun completed with status `central_south_america_idempotency_rollback_complete`.
- Migration metadata repaired with `supabase migration repair --linked --status applied 20260606120000 20260606120100 20260606120200`.
- Final `supabase migration list --linked` showed all three versions aligned local and remote.

## Final Applied Counts

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

## Runtime User IDs

| Shop | Seed email | User ID |
| --- | --- | --- |
| MTB Guatemala | `michaelzick+mtbguatemala@gmail.com` | `99516366-c4ab-4762-b2d8-0f7c823f5aef` |
| Bike Arenal | `michaelzick+bikearenal@gmail.com` | `51715450-93d9-4117-aee3-3195092a8552` |
| Nosara MTB | `michaelzick+nosaramtb@gmail.com` | `0fc17b2c-b17b-4ba4-bf36-4487a6aabea2` |
| Buen Camino Bike Park | `michaelzick+buencamino@gmail.com` | `b070e33f-7b1a-49e9-a4f1-3e479b1e034c` |
| Line Up Surf Shop | `michaelzick+lineuptrade@gmail.com` | `3595c224-e776-4703-b9ec-5f7f084bc95d` |
| Santa Catalina Surf Shop | `michaelzick+santacatalinasurfshop@gmail.com` | `b431102c-2b78-4765-b1f9-2c3601d1a453` |
| Sunzal Surf Company | `michaelzick+sunzalsurfcompany@gmail.com` | `1a4c4fad-cade-4d14-83d2-82fefcd69fca` |
