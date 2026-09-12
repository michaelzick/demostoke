# September 2026 security repairs

Based on `main` at `03887ab`, including the latest surf-first changes.

## Changes

- Map popups render public names, addresses, owners and gear text with DOM `textContent`, preventing stored HTML execution. All consumers use `setDOMContent`.
- SSR JSON-LD and hydration JSON escape `<`. Metadata and rendered HTML insertion use replacement callbacks so user-supplied `$&`, `$'` and related sequences remain literal.
- Discovery, retailer crawling and HTML extraction require verified admins before paid work. Both blog generators support verified signed-in editors; generated posts carry the verified caller's `user_id` and use their JWT for database writes through existing RLS. Payloads have runtime schemas and size/count limits.
- Image downloads/conversions/probes validate HTTPS URLs and literal IPs, resolve A/AAAA records, and manually validate each redirect. Limits: five redirects, 15 seconds per operation (including DNS and body reads), 20 MiB per download. Probes cancel response bodies. The download error path no longer attempts to consume the request body twice.
- Anonymous contact submission retains required reCAPTCHA. Fields are bounded, HTML is escaped, provider errors are checked, and private submission/provider data is removed from logs and responses. Client lengths account for the subject prefix.
- The homepage balances its heading and keeps “Shops and Shapers” together. All latest category ordering, surf-first behavior and Riptyde links remain.
- Type checking now explicitly checks the app and Vite projects. The old root solution command had no input files and silently skipped both. Fixed the missing inventory-page icon import, SSR test fixture, and equipment insert/projection types that the real check exposed.

No database migrations, grants, RLS, public visibility rules, or profile privacy controls are changed. Public shops, profiles, contact details and gear remain public.

## Dependency audit and remaining limits

Compatible updates reduced `npm audit` from 19 affected package entries (8 high) to 2 moderate entries, with no high or critical findings. An Express-scoped `qs` override selects patched major-6 releases because Express 4.22.2's `~6.15.1` range excludes 6.16.0. Remove the override once Express's own range includes a patched version.

The remaining entries are `react-router` and its dependent `react-router-dom`. The audit's remediation requires React Router 7.18 or later, which is outside the agreed compatible-updates scope:

- [Open redirect via backslash in Link/useNavigate](https://github.com/advisories/GHSA-wrjc-x8rr-h8h6)
- [Constructor injection in deserializeErrors hydration](https://github.com/advisories/GHSA-337j-9hxr-rhxg)

Application URL/DNS checks do not pin the destination connection IP, so DNS rebinding remains a limitation. Network egress controls complement these checks. There are no infrastructure changes in this branch. See [OWASP SSRF guidance](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html).

This is a focused repair of reproduced findings, not a guarantee that the application has no other vulnerabilities.

## Validation and rollout

Security regressions cover HTML/script breakouts, literal replacement tokens, verified ownership, unauthorized/forbidden callers, admin and editor success paths, malformed/oversized input, anonymous contact success/failure, private IP/DNS/redirect rejection, valid public redirects, byte limits, timeouts, and cleanup. The normal suite includes existing public/hidden gear visibility checks.

Validation: `npm run lint`, explicit app/Vite `npm run type-check`, client/server `npm run build`, the full unit suite, `deno check` on all changed Edge Function entrypoints, and `git diff --check`.

Production homepage verified in Chromium at 320, 375, 768, 1024 and 1440 pixels: “Shops and Shapers” stays on one line, without heading/page overflow or page errors. Deno header probes against existing Pexels and Google public image origins returned HTTP 200 with image content types.

All 10 changed Edge Functions and their shared helpers were **deployed on September 12, 2026** to linked project `qtlhqsqanbxgfbcjigrl`. Post-deploy metadata confirmed all 10 are ACTIVE with new versions and bundle hashes, with every existing `verify_jwt` setting preserved and no unrelated functions changed. Live checks returned HTTP 200 for all preflights, HTTP 401 for anonymous calls to the nine protected tools, and HTTP 400 for an invalid anonymous contact submission. The contact client remains compatible with the old function's success response; the new function returns only `{ success: true }`. No real email or paid generation requests were sent during validation.

| Deployed function | Version | Existing gateway JWT verification |
|---|---:|---|
| `rental-discovery-agent` | 58 | false |
| `crawl-retailer-details` | 171 | false |
| `extract-gear-from-html` | 165 | true |
| `generate-blog-post` | 252 | true |
| `generate-blog-text` | 214 | true |
| `send-contact-email` | 412 | true |
| `download-store-image` | 305 | true |
| `convert-image-to-webp` | 347 | true |
| `convert-to-jpeg` | 318 | true |
| `scan-broken-images` | 40 | false |

## Signed-in Chrome follow-up repairs

The localhost UI pass exposed three issues: the image scanner treated CDN throttling as broken URLs, Explore announced empty results before its location-gated query ran, and the blog creator overflowed a 375px viewport by 11–12px.

- The scanner now shares one in-flight check per image URL and stops subsequent probes to hosts returning 429. It does not retry throttling or server errors immediately with GET. Only a GET-confirmed 404/410 is a deletion candidate; timeouts, blocked requests, unsafe URLs, network errors, and unexpected content types are inconclusive. The UI filters legacy responses too, groups retry URLs, preserves exact failed rows after a partial bulk deletion, and links confirmed failures to resolvable gear URLs. Scanning remains read-only.
- Scan results distinguish the bounded page from the full count. The current scan covers the newest 1,000 image records; older records are explicitly identified as unchecked. Full-inventory pagination is not part of this repair.
- Explore waits for a resolved location decision and a successful equipment query before reporting results or firing empty-result analytics.
- The blog creator's flex container can shrink to the viewport. Its mobile SEO sheet now uses the dialog title/description primitives so screen readers receive its name without a missing-title error.

Follow-up validation: 320 unit tests across 36 files passed, including shared URL deduplication, host throttling, HEAD-to-GET recovery, 404/410 confirmation, transient/network failures, legacy response filtering, partial-delete bookkeeping with mocks, and disabled/loading/failed Explore queries. Lint, app/Vite type checks, client/server build, scanner Deno check, and whitespace validation passed. Existing build chunk/dynamic-import warnings remain.

`scan-broken-images` was redeployed to the linked project on September 12, 2026 as version **40**, ACTIVE with its existing `verify_jwt=false` setting and in-function admin verification preserved. No other function metadata changed in this follow-up.

Signed-in Chrome at `http://localhost:8080/` verified:

- `/admin` → Tools: the deployed scan reported **1,000 of 3,822 images checked, zero broken, zero inconclusive**, compared with 919 false positives during the earlier pass. No deletion control appeared. The scanner summary and controls also fit at 375px.
- `/explore?category=surfboards`: the initial location-loading screen had no empty-result toast; the loaded hybrid view displayed **515 surfboards**, with four in the local map area.
- `/blog/create`: document width equaled viewport width at **320px and 375px**; the SEO sheet opened and closed, had the accessible name “SEO Analysis,” and emitted no console errors in a fresh tab. The form stayed blank throughout.

No blog posts, gear, profiles, demo events, image records, or other content were created, modified, or deleted by this UI pass. Test tabs were closed and viewport overrides reset. The user's existing Vite server on port 8080 was left running. Web/SSR changes await the normal application release; Edge Function changes described above are live.
