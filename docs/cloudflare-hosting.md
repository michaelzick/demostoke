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

`server/app.js` is the shared Express factory. `server/index.js` provides filesystem-backed assets, lazy SSR loading, compression, and the traditional Node listener. `server/worker.js` provides bundled HTML and SSR imports through Cloudflare's Node HTTP adapter. The same implementation handles metadata, canonical redirects, real 404 responses, public-record visibility, security headers, and the dynamic sitemap.

`npm run build:cloudflare` builds the Vite client/SSR outputs and bundles the Worker with Node module resolution. This avoids Express 4's legacy browser mappings disabling iconv-lite's Node streams. The built Worker uses Node's createRequire for bundled CommonJS dependencies that access supported Node builtins. Wrangler uploads this bundle without rebundling it.

The assets binding serves static files. `/`, `/index.html`, and `/sitemap.xml` reach the Worker, and unmatched paths reach Express for server-rendered routing. Assets are not configured with an SPA fallback on the main app, because that would turn unknown URLs into false 200 responses and skip SEO enrichment.

## Configuration and secrets

The main site's checked-in Supabase URL and publishable key are public browser configuration. They also provide the default SSR metadata connection. FleetOps builds require `VITE_WIDGET_SUPABASE_URL`, `VITE_WIDGET_SUPABASE_PUBLISHABLE_KEY`, and `VITE_WIDGET_STRIPE_PUBLISHABLE_KEY`; these are browser-public values, not service credentials. Preserve the existing widget hostname and embed permissions.

Do not copy DigitalOcean's shared `STRIPE_SECRET_KEY` into any browser build. Stripe, email, AI, and service-role credentials remain in Supabase. No database migration or Edge Function deployment is required by the hosting port.

## DNS and rollback

Cloudflare nameservers: `elaine.ns.cloudflare.com` and `ezra.ns.cloudflare.com`. Retain the existing Google site-verification, DMARC, Resend DKIM, and SPF records. The original DigitalOcean zone contains no MX records; migration must not invent email routing.

The DigitalOcean app `8b602f38-1268-4375-bef4-46d9001db792` remains active. It also hosts unrelated ZICKONEZERO components. **Do not archive, delete, or disable that app.** Its original DNS zone is retained with `ns1.digitalocean.com`, `ns2.digitalocean.com`, and `ns3.digitalocean.com`. A nameserver rollback can restore that zone if necessary; allow for resolver caches. Cloudflare Worker rollback can restore an earlier version without changing DNS.

Private infrastructure snapshots live outside Git in `~/.codex/migration-backups/demostoke-2026-09-28/`. Never commit the raw app spec, local environment files, credentials, or account exports.

## Validation

Run the repository's Node 24 CI gates (`npm ci`, lint, type check, production build, and unit tests), `npm run build:cloudflare`, and `npx wrangler deploy --dry-run`. Local Node installations that expose native Web Storage to Vitest may need `NODE_OPTIONS=--no-experimental-webstorage` so jsdom owns browser storage.

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
