# SEO Search Traffic Fix — Bugfix Design

## Overview

DemoStoke has stopped receiving organic search traffic due to seven interconnected SEO defects. The fix strategy is:

1. **Sitemap**: Delete `public/sitemap.xml` and rely entirely on the already-working runtime `/sitemap.xml` endpoint in `server/index.js`, which correctly fetches dynamic content from Supabase and excludes private routes.
2. **Demo event URL**: Remove the 301 redirect in `server/index.js` that sends `/demo-calendar/event/:slug` → `/demo-events/:slug`. The canonical URL is `/demo-calendar/event/:slug` — used by the sitemap, client routes, and SSR metadata.
3. **Search Console verification**: Add a placeholder `google[token].html` file to `public/` for the user to replace with their actual verification token.
4. **Core Web Vitals**: Install `web-vitals` and report LCP, INP, CLS to GA4 via `window.dataLayer`.
5. **GA4 page views**: The GTM container (GTM-MHM2XTTV) is already firing `page_view` events via `GoogleTagManager.tsx`. The fix documents how to verify the GTM GA4 tag is configured, and optionally adds a direct `gtag.js` snippet as a fallback (requires user to supply their `G-` measurement ID).

## Glossary

- **Bug_Condition (C)**: Any of the seven conditions that degrade organic search visibility — stale/incorrect sitemap, redirect chain on demo event URLs, missing Search Console verification, absent Core Web Vitals reporting, or missing GA4 page view data.
- **Property (P)**: The desired correct behavior for each bug condition — complete dynamic sitemap, single canonical demo event URL, verifiable Search Console ownership, reported CWV metrics, and confirmed GA4 page views.
- **Preservation**: Existing SSR meta tag injection, non-www → www redirect, `robots.txt` behavior, Amplitude tracking, and GTM `page_view` dataLayer pushes must remain unchanged.
- **`server/index.js`**: Express SSR server. Contains the runtime `/sitemap.xml` endpoint (correct) and the problematic `/demo-calendar/event/:slug` → `/demo-events/:slug` redirect (defective).
- **`scripts/generate-sitemap.js`**: Build-time static sitemap generator. Silently skips dynamic routes when Supabase env vars are absent. Includes private pages. Will be removed from the pipeline.
- **`public/sitemap.xml`**: Stale static file with 20 URLs including private pages. Will be deleted.
- **`GoogleTagManager.tsx`**: Pushes `page_view` to `window.dataLayer` on every SPA route change.
- **`web-vitals`**: npm package that measures LCP, INP, CLS, FCP, TTFB in the browser.
- **GTM container**: GTM-MHM2XTTV — loaded in `index.html`. Must have a GA4 Configuration tag to forward `page_view` events to GA4.

## Bug Details

### Bug Condition

The bugs manifest across the sitemap pipeline, server routing, site verification, and analytics layers. Together they prevent Google from correctly crawling, indexing, and attributing traffic to the site.

**Formal Specification:**

```
FUNCTION isBugCondition(input)
  INPUT: input of type { context: string, url?: string, envVars?: object }
  OUTPUT: boolean

  IF context = "sitemap_generation"
    RETURN staticSitemapExists(public/sitemap.xml)
           OR dynamicRoutesOmittedFromSitemap()
           OR privateUrlsIncludedInSitemap()

  IF context = "demo_event_request"
    RETURN url MATCHES /^\/demo-calendar\/event\/.+/
           AND serverRedirects(url, "/demo-events/" + slug)

  IF context = "search_console_verification"
    RETURN NOT fileExistsInPublic("google*.html")

  IF context = "core_web_vitals"
    RETURN NOT packageInstalled("web-vitals")

  IF context = "ga4_page_view"
    RETURN GTM_GA4_tag_not_configured()
           AND no_direct_gtag_snippet_present()

  RETURN false
END FUNCTION
```

### Examples

- **1.1 / 1.2**: Googlebot fetches `https://www.demostoke.com/sitemap.xml` and receives a static file with 20 URLs, none of which are blog posts, gear listings, or demo events. The runtime endpoint at the same URL would return hundreds of dynamic URLs — but the static file in `public/` is served first by `sirv` before the Express route handler runs.
- **1.3**: The static `public/sitemap.xml` includes `/profile`, `/my-gear`, `/admin`, `/api/gear/search`. Googlebot crawls these, wastes crawl budget, and may surface auth-gated pages in search results.
- **1.4**: A blog post links to `/demo-calendar/event/north-shore-surf-demo-11-15-2024-0900`. The server issues a 301 to `/demo-events/north-shore-surf-demo-11-15-2024-0900`. The sitemap and client router use `/demo-calendar/event/` — so the indexed URL and the canonical URL diverge.
- **1.5**: Google Search Console shows "Ownership verification failed" because `GET /google1a2b3c4d.html` returns 404.
- **1.6**: No CWV data appears in Google Search Console's Core Web Vitals report or in GA4, so performance regressions go undetected.
- **1.7**: GA4 shows zero sessions from organic search. GTM fires but no GA4 Configuration tag is set up to consume the `page_view` dataLayer events.

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- SSR meta tag injection for blog posts, gear pages, demo event pages, and static routes must continue to work exactly as before (`server/index.js` GET `*` handler).
- The non-www → www 301 redirect middleware in `server/index.js` must remain unchanged.
- `robots.txt` must continue to disallow private routes and reference the sitemap URL.
- `GoogleTagManager.tsx` must continue to push `page_view` events to `window.dataLayer` on every SPA route change.
- Amplitude tracking via `src/utils/tracking.ts` must be unaffected.
- All existing client-side routes must continue to render correctly.

**Scope:**
All server behavior that does NOT involve the `/demo-calendar/event/:slug` redirect or the static `public/sitemap.xml` file should be completely unaffected. This includes:
- All SSR metadata enrichment routes (`/blog/:slug`, `/gear/:slug`, `/demo-events/:slug`, `/user-profile/:slug`)
- Security headers middleware
- Compression middleware
- Static asset serving via `sirv`

## Hypothesized Root Cause

1. **Static file shadows runtime endpoint (1.1, 1.2, 1.3)**: `sirv` serves files from `public/` before Express route handlers run. So `public/sitemap.xml` is returned instead of the `/sitemap.xml` Express handler. The static file was generated by `generate-sitemap.js` without Supabase env vars (silently skipping dynamic routes) and includes private pages. The `generate-sitemap` script is also not in the `build` npm script, so even if env vars were available, the file would never be regenerated on deploy.

2. **Mismatched canonical URL for demo events (1.4)**: `server/index.js` has an explicit redirect: `app.get(['/event/:eventSlug', '/demo-calendar/event/:eventSlug'], ...)` → `/demo-events/:slug`. However, the runtime sitemap endpoint generates URLs as `/demo-calendar/event/:slug` (via `buildDemoEventPath`), and the client router uses `/demo-calendar/event/`. The redirect was likely added during a URL scheme migration that was never completed — the `/demo-events/` path is the old scheme.

3. **Missing verification file (1.5)**: No `google*.html` file was ever added to `public/`. This is a simple omission.

4. **Missing web-vitals package (1.6)**: `web-vitals` is not in `package.json` dependencies. No CWV reporting code exists anywhere in the codebase.

5. **GTM not wired to GA4 (1.7)**: GTM-MHM2XTTV is loaded and `page_view` events are pushed to `dataLayer` correctly by `GoogleTagManager.tsx`. However, if no GA4 Configuration tag exists inside the GTM container, those events are never forwarded to GA4. This is a GTM configuration issue, not a code issue — but a direct `gtag.js` fallback can be added as insurance.

## Correctness Properties

Property 1: Bug Condition — Runtime Sitemap Serves Complete, Clean URL Set

_For any_ request to `GET /sitemap.xml`, the fixed server SHALL return an XML document that includes all published blog posts, all equipment listings, and all demo events fetched from Supabase, and SHALL NOT include any private or auth-gated URLs (`/profile`, `/my-gear`, `/analytics`, `/bookings`, `/admin`, `/list-your-gear/add-gear-form`, `/api/gear/search`).

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Bug Condition — Demo Event URLs Have No Redirect Chain

_For any_ request to `/demo-calendar/event/:slug`, the fixed server SHALL respond with the rendered page (200) at that URL without issuing any redirect, and the URL SHALL match the canonical URL used in the sitemap and client router.

**Validates: Requirements 2.4**

Property 3: Bug Condition — Search Console Verification File Is Served

_For any_ request to `GET /google[token].html`, the fixed server SHALL return 200 with the correct verification content from `public/`.

**Validates: Requirements 2.5**

Property 4: Bug Condition — Core Web Vitals Are Reported

_For any_ page load in production, the fixed application SHALL call `onLCP`, `onINP`, and `onCLS` from the `web-vitals` package and push the metric values to `window.dataLayer` for GA4 consumption.

**Validates: Requirements 2.6**

Property 5: Preservation — SSR Metadata and Existing Server Behavior Unchanged

_For any_ request to a non-demo-event, non-sitemap route, the fixed server SHALL produce exactly the same HTML response as the original server, preserving all SSR meta tag injection, structured data, Open Graph tags, and redirect behavior.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**

## Fix Implementation

### Changes Required

**1. Delete `public/sitemap.xml`**

Remove the static file entirely. The runtime `/sitemap.xml` endpoint in `server/index.js` already serves a complete, correct sitemap. With the static file gone, `sirv` will no longer shadow the Express handler.

**2. Remove demo event redirect from `server/index.js`**

File: `server/index.js`

Delete this block (lines ~490–495):
```js
app.get(['/event/:eventSlug', '/demo-calendar/event/:eventSlug'], (req, res) => {
  const protocol = req.get('x-forwarded-proto') || req.protocol || 'https';
  const host = req.get('host') || 'www.demostoke.com';
  const redirectUrl = `${protocol}://${host}/demo-events/${req.params.eventSlug}`;
  res.redirect(301, redirectUrl);
});
```

The SSR `GET *` handler already handles `/demo-calendar/event/:slug` correctly — it calls `getDemoEventPageMeta` which resolves the event and injects the correct canonical URL (`/demo-events/:slug` from `buildDemoEventPath`).

> **Note**: After removing the redirect, verify that `buildDemoEventPath` in `server/index.js` generates `/demo-calendar/event/:slug` (not `/demo-events/:slug`). Currently it returns `/demo-events/${generateDemoEventSlug(event)}`. This must be updated to `/demo-calendar/event/${generateDemoEventSlug(event)}` to make the canonical URL consistent with the client router and sitemap.

**3. Add Google Search Console verification placeholder**

File: `public/googleSEARCH_CONSOLE_TOKEN.html`

Create a placeholder file. The user must replace the filename and content with their actual token from Google Search Console → Settings → Ownership verification → HTML file method.

```html
google-site-verification: googleSEARCH_CONSOLE_TOKEN.html
```

**4. Install `web-vitals` and add reporting**

```bash
npm install web-vitals
```

File: `src/lib/vitals.ts` (new file)

```ts
import { onCLS, onINP, onLCP } from 'web-vitals';

function sendToGA4(metric: { name: string; value: number; id: string }) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'web_vitals',
    metric_name: metric.name,
    metric_value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    metric_id: metric.id,
  });
}

export function reportWebVitals() {
  onCLS(sendToGA4);
  onINP(sendToGA4);
  onLCP(sendToGA4);
}
```

File: `src/main.tsx` — call `reportWebVitals()` after the app mounts.

**5. GA4 direct gtag fallback (requires user input)**

If the user can provide their `G-XXXXXXXXXX` measurement ID, add a direct `gtag.js` snippet to `index.html` as a fallback alongside GTM. This ensures page views reach GA4 even if the GTM GA4 tag is misconfigured.

```html
<!-- Direct GA4 fallback — replace G-XXXXXXXXXX with your measurement ID -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

If the user does not have a `G-` ID, the GTM container must be configured with a GA4 Configuration tag that triggers on all pages and listens for the `page_view` custom event.

## Testing Strategy

### Validation Approach

Two-phase approach: first surface counterexamples on unfixed code to confirm root causes, then verify the fix and check preservation.

### Exploratory Bug Condition Checking

**Goal**: Confirm the static file shadows the runtime endpoint, the redirect fires on `/demo-calendar/event/`, and the verification file is absent. Run on UNFIXED code.

**Test Cases**:
1. **Sitemap static shadow test**: `curl https://www.demostoke.com/sitemap.xml` — expect to see only 20 static URLs with private pages, no blog/gear/event URLs. Confirms bug 1.1/1.2/1.3.
2. **Demo event redirect test**: `curl -I https://www.demostoke.com/demo-calendar/event/some-slug` — expect `301 Location: /demo-events/some-slug`. Confirms bug 1.4.
3. **Verification file test**: `curl -I https://www.demostoke.com/googleSEARCH_CONSOLE_TOKEN.html` — expect `404`. Confirms bug 1.5.
4. **web-vitals package test**: `cat package.json | grep web-vitals` — expect no match. Confirms bug 1.6.
5. **GTM GA4 tag test**: Open GTM container GTM-MHM2XTTV in GTM UI → check for GA4 Configuration tag. If absent, confirms bug 1.7.

**Expected Counterexamples**:
- Sitemap returns private URLs and omits dynamic content
- `/demo-calendar/event/` issues a 301 instead of serving the page
- Verification file returns 404

### Fix Checking

**Goal**: Verify each bug condition is resolved after the fix.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := fixedServer(input)
  ASSERT expectedBehavior(result)
END FOR
```

**Test Cases**:
1. `curl https://www.demostoke.com/sitemap.xml` — response must contain `/blog/`, `/gear/`, `/demo-calendar/event/` URLs and must NOT contain `/profile`, `/admin`, `/api/gear/search`.
2. `curl -I https://www.demostoke.com/demo-calendar/event/some-slug` — must return `200`, not `301`.
3. `curl -I https://www.demostoke.com/google[actual-token].html` — must return `200`.
4. Open browser DevTools → Network → filter `web_vitals` in dataLayer — must see CLS, INP, LCP events after page load.
5. Open GA4 DebugView — must see `page_view` events on SPA navigation.

### Preservation Checking

**Goal**: Verify that all unchanged behaviors are unaffected by the fix.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT originalServer(input) = fixedServer(input)
END FOR
```

**Testing Approach**: Manual smoke tests plus property-based tests for the sitemap URL set.

**Test Cases**:
1. **SSR meta preservation**: `curl https://www.demostoke.com/blog/some-slug` — response HTML must contain correct `<title>`, `<meta name="description">`, `<meta property="og:*">`, and JSON-LD structured data. Must match pre-fix output.
2. **Non-www redirect preservation**: `curl -I http://demostoke.com/` — must return `301 Location: https://www.demostoke.com/`.
3. **robots.txt preservation**: `curl https://www.demostoke.com/robots.txt` — must still disallow `/profile`, `/admin`, etc. and reference `/sitemap.xml`.
4. **GTM dataLayer preservation**: In browser console, navigate between pages and verify `window.dataLayer` receives `page_view` events from `GoogleTagManager.tsx`.
5. **Amplitude preservation**: Verify `trackEvent()` calls still fire without errors after adding `web-vitals` reporting.

### Unit Tests

- Test that `buildDemoEventPath` returns `/demo-calendar/event/:slug` (not `/demo-events/:slug`) after the fix
- Test that the runtime sitemap XML does not contain any of the private URL paths
- Test that the runtime sitemap XML contains at least one entry each for `/blog/`, `/gear/`, `/demo-calendar/event/`
- Test `sendToGA4` pushes correctly shaped objects to `window.dataLayer`

### Property-Based Tests

- Generate random sets of blog/gear/event records and verify the sitemap contains exactly those URLs and no private URLs
- Generate random route paths and verify the fixed server never issues a redirect for `/demo-calendar/event/*` paths
- Generate random CWV metric values and verify `sendToGA4` always pushes a `web_vitals` event with a rounded numeric value

### Integration Tests

- Full SSR render of `/demo-calendar/event/:slug` — verify 200 response, correct canonical URL in `<link rel="canonical">`, and correct JSON-LD Event schema
- Full SSR render of `/blog/:slug` — verify meta tags are unchanged from pre-fix behavior
- Sitemap endpoint integration — verify XML is valid, parses correctly, and contains expected URL count ranges
