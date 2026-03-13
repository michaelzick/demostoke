# Promptfoo Security Red Team

This repo now includes:

- Push-time Promptfoo security checks for `dev` and `main`
- A manual GitHub Actions workflow for full red team runs
- Supabase persistence for runs and findings
- An admin dashboard tab that launches runs and visualizes results

## Required GitHub secrets

- `OPENAI_API_KEY`
- `PROMPTFOO_SUPABASE_URL`
- `PROMPTFOO_REDTEAM_SHARED_SECRET`
- `SECURITY_RESULTS_INGEST_SECRET`
- `SECURITY_INGEST_URL`
- `PROMPTFOO_TEST_USER_EMAIL`
- `PROMPTFOO_TEST_USER_PASSWORD`

Notes:

- `PROMPTFOO_TEST_USER_EMAIL` and `PROMPTFOO_TEST_USER_PASSWORD` are optional for the smoke suite, but required if you want full-suite coverage for authenticated content-generation endpoints.
- `SECURITY_INGEST_URL` should point to `https://<project-ref>.supabase.co/functions/v1/ingest-security-report`.

## Required Supabase function environment variables

### `trigger-security-redteam`

- `GITHUB_ACTIONS_TOKEN`
- `GITHUB_REPOSITORY_OWNER`
- `GITHUB_REPOSITORY_NAME`
- `GITHUB_REDTEAM_WORKFLOW_FILENAME` (optional, defaults to `security-manual-redteam.yml`)

### `security-redteam-target`

- `PROMPTFOO_REDTEAM_SHARED_SECRET`
- `PROMPTFOO_TEST_USER_EMAIL` (optional)
- `PROMPTFOO_TEST_USER_PASSWORD` (optional)

### `ingest-security-report`

- `SECURITY_RESULTS_INGEST_SECRET`

## Local usage

Generate a config:

```bash
npm run security:redteam:config:smoke
```

Run Promptfoo manually after setting the required environment variables:

```bash
npx promptfoo@latest redteam run \
  --config promptfoo/security/generated/promptfooconfig.smoke.json \
  -o promptfoo/security/generated/results.smoke.json \
  -o promptfoo/security/generated/report.smoke.html
```

Normalize and enforce thresholds:

```bash
npm run security:redteam:normalize
npm run security:redteam:assert
```

## Deployment gating

The new GitHub Actions workflows fail when Promptfoo or the threshold policy fails.
To make these checks truly gate deploys, the deployment workflow must depend on `Security Red Team On Push`, or branch protection must require that workflow before merge.
