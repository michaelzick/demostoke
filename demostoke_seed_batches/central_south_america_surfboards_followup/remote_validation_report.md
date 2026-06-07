# Remote Validation Report - Central and South America Surfboards Follow-Up

Status: applied to the linked DemoStoke Supabase project on 2026-06-07.

## Apply Sequence

- Preflight static safety scan found no destructive patterns in executable migration SQL.
- `git diff --check` passed before linked execution.
- `supabase migration list --linked` before apply showed local and remote aligned through `20260606120200`, with only `20260607120000` local-only for this follow-up.
- Read-only linked duplicate checks found Sunzal Surf Company already applied with 33 surfboards, found `Tomo Boss Up` and `Takayama In The Pink` already present, found the three Sunzal follow-up names missing, and found no Nosara Surfboards profile or seed email.
- Rollback dry run with the exact migration file completed with status `central_south_america_surfboards_followup_dry_run_complete`.
- Commit transaction completed with status `central_south_america_surfboards_followup_committed`.
- In-transaction assertions passed before `COMMIT`.
- Read-only validation after commit returned the expected shop counts, gear names, USD prices, and two images per gear row.
- Idempotency rollback rerun completed with status `central_south_america_surfboards_followup_idempotency_rollback_complete`.
- Migration metadata repaired with `supabase migration repair --linked --status applied 20260607120000`.
- Final `supabase migration list --linked` showed `20260607120000` aligned local and remote.

## Final Applied Counts

| Shop | Category | Gear | Images |
| --- | --- | ---: | ---: |
| Sunzal Surf Company | surfboards | 36 | 72 |
| Nosara Surfboards | surfboards | 9 | 18 |
| **Follow-up delta** | | **12** | **24** |

## Runtime User IDs

| Shop | Seed email | User ID |
| --- | --- | --- |
| Sunzal Surf Company | `michaelzick+sunzalsurfcompany@gmail.com` | `1a4c4fad-cade-4d14-83d2-82fefcd69fca` |
| Nosara Surfboards | `michaelzick+nosarasurfboards@gmail.com` | `3fcb7d3b-de1c-4f57-b893-702798801089` |

## Follow-Up Gear

| Shop | Name | Category | $/day |
| --- | --- | --- | ---: |
| Sunzal Surf Company | Hypto Krypto | surfboards | $35.00 |
| Sunzal Surf Company | Barahona 9'0 | surfboards | $30.00 |
| Sunzal Surf Company | Sci-Fi Volume LFT | surfboards | $20.00 |
| Nosara Surfboards | Sharpeye FT Inferno Carbon 5'10 | surfboards | $100.00 |
| Nosara Surfboards | Sharpeye Inferno 72 Carbon 5'10 | surfboards | $95.00 |
| Nosara Surfboards | Firewire Slater Designs S Boss Volcano I-Bolic 6'0 | surfboards | $50.00 |
| Nosara Surfboards | Pyzel Ghost XL 6'2 | surfboards | $50.00 |
| Nosara Surfboards | Firewire Slater Designs S Boss Turquoise I-Bolic 6'2 | surfboards | $50.00 |
| Nosara Surfboards | Sharpeye Mid Length 6'6 | surfboards | $50.00 |
| Nosara Surfboards | Chilli Mid Strength 7'0 | surfboards | $50.00 |
| Nosara Surfboards | Lost Glydra 7'0 | surfboards | $50.00 |
| Nosara Surfboards | Channel Islands CI 2 Pro 5'10 | surfboards | $40.00 |
