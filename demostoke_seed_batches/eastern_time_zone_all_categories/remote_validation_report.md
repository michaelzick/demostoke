# Remote Validation Report - Eastern Time Zone All Categories

Status: not run.

No remote dry run, commit, validation, or idempotency check has been executed for this batch. The migration files are local only and await explicit user approval before any linked Supabase write.

## Local Preparation Completed

- Created shop/user migration for 7 Eastern Time Zone shops.
- Created category-specific gear migrations for surfboards, skis, snowboards, and mountain bikes.
- Created SELECT-only validation SQL.
- Created source audit and rejected-candidate notes.
- Ran linked DB read-only duplicate checks for accepted candidate names/websites before creating the files.
- Ran `supabase migration list --linked`; local and remote migration history were aligned through `20260527110000` before these pending local files were added.

## Expected Counts After Apply

| Category | Expected gear rows |
|---|---:|
| surfboards | 14 |
| skis | 5 |
| snowboards | 2 |
| mountain-bikes | 19 |
| total | 40 |

Each inserted gear row should receive two `equipment_images` rows.
