# Cloudflare hosting

DemoStoke's web applications run on Cloudflare Workers. Supabase remains the database, authentication, storage, scheduled-job, and Edge Function backend.

| Hostnames | Worker | GitHub repository | Build command |
| --- | --- | --- | --- |
| demostoke.com, www.demostoke.com | demostoke | michaelzick/demostoke | npm run build:cloudflare |
| fleet.demostoke.com, widget.demostoke.com | demostoke-fleet | michaelzick/demostoke-fleet-ops | npm run build |
| designsystem.demostoke.com | demostoke-designsystem | michaelzick/ds-design-system-figma | npm run build |
| demoshop.demostoke.com | demostoke-demoshop | michaelzick/big-mountain | npm run build |

Production deploys use `main`. The main repository pins Wrangler in its lockfile; static repositories use `npx wrangler@4.142.0 deploy`. Cloudflare builds must install development dependencies before building. Use Node 24 for the main app and demo shop, and Node 22 for FleetOps/design system. The demo shop also builds under its original Node 20 runtime, but the Cloudflare deployment CLI requires Node 22 or newer.

## Main application

OpenNext builds DemoStoke's Next.js App Router into `.open-next`. The custom Worker entrypoint implements the apex redirect and maps known upstream catalog failures to retryable 503 responses. Next.js owns application routes and metadata. The existing production Worker name and custom domains identify the same service across the migration.

## Preview builds

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` under **Settings → Builds → Previews Base**. Cloudflare copies those variables to new branch previews. An existing preview can receive them through its own build settings. Use Node 24.14.1.

The migration branch can first deploy under the existing base commands, `npm run build:cloudflare` and `npx wrangler preview`. Then configure that branch's Build command as blank and set its Preview command to `npm run deploy:preview`. Use the stable branch URL for review and the immutable deployment URL for verifying the PR commit. Hosted previews serve public reads and are marked `noindex`.

## Production cutover

After explicit release approval, record the active Worker version and current builds settings. Set the production build command to `DEMOSTOKE_DEPLOYMENT_TARGET=production npm run build:cloudflare` and the deploy command to `npx wrangler deploy --config wrangler.jsonc`. Set the public Supabase URL and publishable key in production build settings. Switch Previews Base to an empty Build command and `npm run deploy:preview` when `main` uses Next.js.

Store any optional external gear feed credentials as runtime Worker secrets. The shop feed proxy accepts only the configured HTTPS endpoint and exposes public inventory. Stripe, email, AI, and Supabase service-role credentials stay in Supabase.

## DNS and rollback

Cloudflare nameservers: `elaine.ns.cloudflare.com` and `ezra.ns.cloudflare.com`. Retain the existing Google site-verification, DMARC, Resend DKIM, and SPF records. The original DigitalOcean zone contains no MX records; migration must not invent email routing.

The DigitalOcean app `8b602f38-1268-4375-bef4-46d9001db792` remains active. It also hosts unrelated ZICKONEZERO components. **Do not archive, delete, or disable that app.** Its original DNS zone is retained with `ns1.digitalocean.com`, `ns2.digitalocean.com`, and `ns3.digitalocean.com`. A nameserver rollback can restore that zone if necessary; allow for resolver caches. Cloudflare Worker rollback can restore an earlier version without changing DNS.

Private infrastructure snapshots live outside Git in `~/.codex/migration-backups/demostoke-2026-09-28/`. Never commit the raw app spec, local environment files, credentials, or account exports.

## Validation

Run the repository's Node 24 CI gates (`npm ci`, lint, type check, OpenNext build, and unit tests) and `npx wrangler deploy --dry-run`. Local Node installations that expose native Web Storage to Vitest may need `NODE_OPTIONS=--no-experimental-webstorage` so jsdom owns browser storage.

Check the deployed Worker and custom hostnames: homepage, `/about`, `/gear/surfboards`, faceted search canonicals/noindex, a real gear and blog detail, unknown-route 404/noindex, legacy event redirects, `/robots.txt`, `/sitemap.xml`, static JS/CSS, FleetOps sign-in, `widget.html`, `widget-loader.js`, and the demo shop's embedded widget. Confirm authoritative DNS and HTTPS after registrar cutover, plus all four Git-connected Cloudflare production builds.

## DNS cutover (September 28, 2026)

Namecheap now delegates demostoke.com to `elaine.ns.cloudflare.com` and
`ezra.ns.cloudflare.com`. Cloudflare holds the six Worker custom domains and all
four pre-existing TXT records (Google verification, DMARC, SPF, and DKIM).
The DigitalOcean app and DNS zone remain available; neither was archived.

Cloudflare Builds is connected to `michaelzick/demostoke`, production branch
`main`, with `npm run build:cloudflare`, `npx wrangler deploy`, and Node 24.14.1.
The repository's CI and Security workflows were already manually disabled;
their local migration checks passed, and hosted CodeQL passed for PR #179.

DigitalOcean custom-domain attachments must be released after cutover because its
Cloudflare for SaaS registrations can take precedence over the new zone. The
app and its default DigitalOcean URL remain active. To roll back, reattach the
six DemoStoke domains using the backed-up app spec before restoring DNS.

Branch previews use the same public data configuration and NODE_ENV=production,
with Cloudflare managing separate preview deployments.

## Verified production handoff

All six hostnames served Cloudflare Workers directly over valid HTTPS after the
final cutover on September 28, 2026. The apex retains its redirect to `www`.
Always Use HTTPS is enabled. The wildcard Universal SSL certificate is active;
it covers the apex and all five first-level subdomains.

The initial handoff briefly failed TLS because certificate issuance was still
pending. DigitalOcean domain attachments and delegation were restored until the
Cloudflare certificate became active. Future migrations must verify an active
certificate before releasing the previous provider's custom hostnames.

Production checks covered SSR metadata on gear, blog, and event details; unknown
route 404s; robots and sitemap; FleetOps assets; the live 21-item booking widget;
and the demo shop's embedded widget. All four Git-connected production builds
passed. No payment or outbound email was submitted during these smoke checks.

The retained DigitalOcean app still serves its default URL and unrelated
ZICKONEZERO domains. DemoStoke's six custom-domain attachments were released to
remove their Cloudflare for SaaS routing precedence. All components remain, with
fallback component routes in the retained app. Original DNS web records were
restored in the old zone for clients with cached DigitalOcean delegation.
