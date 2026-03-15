# Implementation Plan

- [x] 1. Write bug condition exploration tests
  - **Property 1: Bug Condition** - SEO Defects: Sitemap Shadow, Demo Event Redirect, Missing Verification, Absent CWV
  - **CRITICAL**: These tests MUST FAIL on unfixed code — failure confirms the bugs exist
  - **DO NOT attempt to fix the tests or the code when they fail**
  - **NOTE**: These tests encode the expected behavior — they will validate the fix when they pass after implementation
  - **GOAL**: Surface counterexamples that demonstrate each bug condition exists
  - **Scoped PBT Approach**: Scope each property to the concrete failing case(s) for reproducibility
  - Test 1 — Sitemap shadow: assert `GET /sitemap.xml` response contains at least one `/blog/`, `/gear/`, and `/demo-calendar/event/` URL, and contains NONE of `/profile`, `/my-gear`, `/admin`, `/api/gear/search` (from Bug Condition: `staticSitemapExists(public/sitemap.xml) OR dynamicRoutesOmittedFromSitemap() OR privateUrlsIncludedInSitemap()`)
  - Test 2 — Demo event redirect: assert `GET /demo-calendar/event/test-slug` returns status 200, not 301 (from Bug Condition: `url MATCHES /^\/demo-calendar\/event\/.+/ AND serverRedirects(url, "/demo-events/" + slug)`)
  - Test 3 — Verification file: assert `GET /googleSEARCH_CONSOLE_TOKEN.html` returns status 200, not 404 (from Bug Condition: `NOT fileExistsInPublic("google*.html")`)
  - Test 4 — CWV reporting: assert `web-vitals` is listed in `package.json` dependencies and `reportWebVitals()` is called from the app entry point (from Bug Condition: `NOT packageInstalled("web-vitals")`)
  - Run all tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests FAIL (this is correct — it proves the bugs exist)
  - Document counterexamples found (e.g., "sitemap returns /profile", "/demo-calendar/event/slug returns 301", "verification file returns 404", "web-vitals absent from package.json")
  - Mark task complete when tests are written, run, and failures are documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - SSR Metadata, Non-www Redirect, robots.txt, GTM dataLayer, Amplitude
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: `GET /blog/:slug` returns HTML with correct `<title>`, `<meta name="description">`, `<meta property="og:*">`, and JSON-LD on unfixed code
  - Observe: `GET /gear/:slug` returns HTML with correct SSR meta tags on unfixed code
  - Observe: `GET /demo-events/:slug` returns HTML with correct SSR meta tags on unfixed code (note: this is the OLD path, still served by SSR `GET *` handler)
  - Observe: `GET /robots.txt` disallows `/profile`, `/admin`, etc. and references `/sitemap.xml`
  - Observe: `window.dataLayer` receives `page_view` events from `GoogleTagManager.tsx` on SPA navigation
  - Write property-based test: for all non-sitemap, non-demo-event-redirect routes, the server response HTML is unchanged (from Preservation Requirements in design)
  - Write property-based test: for any random slug, `GET /blog/:slug` always returns a response containing `<meta property="og:` (SSR meta injection is present)
  - Verify all tests PASS on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 3. Fix SEO search traffic defects

  - [x] 3.1 Delete `public/sitemap.xml`
    - Remove the static file so `sirv` no longer shadows the Express `/sitemap.xml` route handler
    - The runtime endpoint in `server/index.js` already fetches dynamic content from Supabase and excludes private routes
    - _Bug_Condition: `staticSitemapExists(public/sitemap.xml)` — sirv serves static file before Express handler runs_
    - _Expected_Behavior: `GET /sitemap.xml` returns dynamic XML with all blog/gear/event URLs and no private URLs_
    - _Preservation: Static asset serving for all other files in `public/` must be unaffected_
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 3.2 Fix `buildDemoEventPath` in `server/index.js`
    - Change return value from `/demo-events/${generateDemoEventSlug(event)}` to `/demo-calendar/event/${generateDemoEventSlug(event)}`
    - This aligns the canonical URL used in the sitemap with the client router and SSR metadata
    - _Bug_Condition: `buildDemoEventPath` returns `/demo-events/:slug` instead of `/demo-calendar/event/:slug`_
    - _Expected_Behavior: Sitemap URLs for demo events use `/demo-calendar/event/:slug`_
    - _Preservation: `getDemoEventPageMeta` SSR logic must continue to resolve event metadata correctly_
    - _Requirements: 2.4_

  - [x] 3.3 Remove demo event redirect block from `server/index.js`
    - Delete the `app.get(['/event/:eventSlug', '/demo-calendar/event/:eventSlug'], ...)` block that 301-redirects to `/demo-events/:slug`
    - The SSR `GET *` handler already handles `/demo-calendar/event/:slug` correctly
    - _Bug_Condition: `url MATCHES /^\/demo-calendar\/event\/.+/ AND serverRedirects(url, "/demo-events/" + slug)`_
    - _Expected_Behavior: `GET /demo-calendar/event/:slug` returns 200 with rendered page, no redirect_
    - _Preservation: All other `app.get(...)` route handlers and middleware must remain unchanged_
    - _Requirements: 2.4_

  - [x] 3.4 Create Google Search Console verification placeholder
    - Create `public/googleSEARCH_CONSOLE_TOKEN.html` with content: `google-site-verification: googleSEARCH_CONSOLE_TOKEN.html`
    - User must replace the filename and content with their actual token from Google Search Console → Settings → Ownership verification → HTML file method
    - _Bug_Condition: `NOT fileExistsInPublic("google*.html")` — verification file returns 404_
    - _Expected_Behavior: `GET /google[token].html` returns 200 with verification content_
    - _Preservation: No other files in `public/` are affected_
    - _Requirements: 2.5_

  - [x] 3.5 Install `web-vitals` and create `src/lib/vitals.ts`
    - Run `npm install web-vitals`
    - Create `src/lib/vitals.ts` with `reportWebVitals()` that calls `onCLS`, `onINP`, `onLCP` and pushes `web_vitals` events to `window.dataLayer`
    - Each metric push must include `event: 'web_vitals'`, `metric_name`, `metric_value` (rounded integer), and `metric_id`
    - _Bug_Condition: `NOT packageInstalled("web-vitals")` — no CWV data in Search Console or GA4_
    - _Expected_Behavior: On every page load, CLS/INP/LCP values are pushed to `window.dataLayer` as `web_vitals` events_
    - _Preservation: Existing `window.dataLayer` pushes from `GoogleTagManager.tsx` and Amplitude tracking must be unaffected_
    - _Requirements: 2.6_

  - [x] 3.6 Call `reportWebVitals()` from app entry point
    - Import and call `reportWebVitals()` from `src/main.tsx` after the app mounts
    - _Bug_Condition: `reportWebVitals()` never called — metrics never collected_
    - _Expected_Behavior: CWV metrics are collected and pushed to `window.dataLayer` on every page load_
    - _Preservation: Existing app bootstrap logic in `src/main.tsx` must be unaffected_
    - _Requirements: 2.6_

  - [x] 3.7 Add GA4 gtag.js placeholder comment to `index.html`
    - Add a comment block in `index.html` documenting how to add a direct `gtag.js` fallback snippet with the user's `G-XXXXXXXXXX` measurement ID
    - This is a documentation-only change unless the user supplies their measurement ID
    - _Bug_Condition: `GTM_GA4_tag_not_configured() AND no_direct_gtag_snippet_present()`_
    - _Expected_Behavior: GA4 receives `page_view` events either via GTM GA4 Configuration tag or direct gtag.js snippet_
    - _Preservation: Existing GTM script tag and `window.dataLayer` initialization must be unaffected_
    - _Requirements: 2.7_

  - [x] 3.8 Verify bug condition exploration tests now pass
    - **Property 1: Expected Behavior** - SEO Defects Resolved
    - **IMPORTANT**: Re-run the SAME tests from task 1 — do NOT write new tests
    - The tests from task 1 encode the expected behavior
    - When these tests pass, it confirms the expected behavior is satisfied
    - Run all bug condition exploration tests from step 1
    - **EXPECTED OUTCOME**: All tests PASS (confirms all bugs are fixed)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [x] 3.9 Verify preservation tests still pass
    - **Property 2: Preservation** - SSR Metadata and Existing Server Behavior Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 — do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm SSR meta injection, non-www redirect, robots.txt, GTM dataLayer, and Amplitude are all unaffected

- [x] 4. Checkpoint — Ensure all tests pass
  - Ensure all tests pass; ask the user if questions arise
  - Remind user to replace `public/googleSEARCH_CONSOLE_TOKEN.html` with their actual Google Search Console verification file
  - Remind user to verify GTM container GTM-MHM2XTTV has a GA4 Configuration tag, or supply their `G-XXXXXXXXXX` measurement ID for the direct gtag.js fallback in `index.html`
