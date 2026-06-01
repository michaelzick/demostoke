# Local Test Report - North America Coverage Fill

Status: local preparation only. No linked DB writes were run.

## Completed Before File Generation

- Created and switched to branch `codex/north-america-gear-coverage`.
- Ran `supabase migration list --linked`; local and linked migration metadata were aligned through the existing May 31, 2026 seed migrations.
- Ran read-only linked DB duplicate checks for selected shop names, domains, and websites; selected shops returned zero matches.
- Verified official source pages for accepted shops and documented held/rejected candidates.

## Completed After File Generation

```bash
rg -n "DELETE FROM|TRUNCATE|ALTER TABLE|ON CONFLICT|specs" supabase/migrations/20260601120*.sql
LC_ALL=C rg -n "[^[:ascii:]]" supabase/migrations/20260601120*.sql demostoke_seed_batches/north_america_coverage_fill
git diff --check
supabase migration list --linked
node -e "JSON.parse(require('fs').readFileSync('demostoke_seed_batches/north_america_coverage_fill/sources.json','utf8')); console.log('sources.json ok')"
```

Results:

- No unsafe write/destructive schema matches in the generated migrations.
- No non-ASCII text in generated seed files or audit docs.
- No disallowed skill-level strings starting with `Intermediate` or `Advanced`.
- `sources.json` parsed successfully.
- `git diff --check` returned no whitespace errors.
- `supabase migration list --linked` shows these five migrations as local-only until the user approves remote application.
