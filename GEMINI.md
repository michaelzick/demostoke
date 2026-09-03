# DemoStoke Agent Memory

## Canonical Shared Memory
- This `AGENTS.md` file is the canonical shared project memory for this repository.
- `CLAUDE.md` and `GEMINI.md` import this file so Claude and Gemini inherit the same repository map Codex uses.
- Whenever you make code changes, check whether this memory is now stale. If routes, structure, commands, environment variables, schema, integrations, or durable behavior changed, update this file in the same change. Treat stale agent memory as a bug.
- If you add harness-specific rules later, keep this file as the shared source of truth and keep `CLAUDE.md` / `GEMINI.md` aligned.

## Coding Standards
- The canonical coding standards for this repository are defined in `skills/coding-standards.md`.
- All agents and engineers must adhere to these standards before implementation, refactoring, or review.

## Project Summary
- DemoStoke is a Vite + React + TypeScript marketplace for action-sports gear demos, rentals, listings, profiles, and related content.
- Core product areas:
  - marketplace discovery with map/list/hybrid views
  - gear detail pages with canonical URLs and SSR SEO metadata
  - owner profiles and gear management
  - blog/CMS with AI-assisted content tooling
  - demo-event calendar and candidate ingestion
  - gear quiz / recommendation flow
  - admin tooling for users, discovery, media, and data cleanup
  - widget and external shop-feed ingestion
- Live data is centered on Supabase. Some surfaces are still mock or placeholder: `AnalyticsPage`, `BookingsPage`, `PrivatePartyPage`, and parts of the Lightspeed flow.
- Category strategy (September 2026): DemoStoke is surf-first. Surfboards lead every category list, the homepage, site metadata, the explore fallback map center, the quiz default, the weekly gear-review draft mix, and demo-event discovery order. Snowboards, skis, and mountain bikes remain fully supported long-tail categories: do not delete categories, routes, inventory, or content to narrow scope. Riptyde (`https://apps.apple.com/us/app/riptyde/id6793336480`) is the companion surf-forecasting iOS app; its App Store link lives in `src/lib/gearCategories.ts` as `RIPTYDE_APP_STORE_URL` and is the only external app link on the site (hero, footer, `/gear/surfboards`). Every Riptyde link renders through `RiptydeLink` / `RiptydeIcon` in `src/components/RiptydeLink.tsx`, which always shows the app icon (`public/img/logos/riptyde-icon.webp`, a 192px WebP derived from the `riptyde-landing-page` repo icon) next to the link text. Riptyde clicks emit the `riptyde_link_click` event with a `source` property only.

## Stack and Runtime
- Node `>=24`
- Vite 8 with Rolldown-backed production builds
- React 18, React Router 6, TanStack Query 5
- Tailwind CSS + shadcn/ui / Radix primitives
- Supabase JS v2 for auth, database, storage, and edge functions
- Express SSR wrapper in `server/index.js`
- `@` path alias points to `src/`
- `npm run dev` uses Vite on port `8080`
- `npm run dev:ssr` uses the Express server and also defaults to `PORT` or `8080`

## Important Commands
- `npm run dev` - Vite dev server
- `npm run dev:ssr` - Express SSR server
- `npm run build` - client + server build
- `npm run lint`
- `npm run type-check`
- `npm run test:unit`
- `npm run generate-sitemap`

## Top-Level Architecture
- `src/main.tsx` is the plain Vite mount entry.
- `src/entry-client.tsx` hydrates the SSR shell when server markup exists and falls back to a plain client mount when Vite serves a non-SSR HTML shell.
- `src/entry-server.tsx` renders the React tree to string.
- `src/App.tsx` wires providers: query client, SSR page data, theme, auth, favorites, geolocation, tooltip, analytics/toaster.
- `src/components/AppRoutes.tsx` is the authoritative route map.
- `server/index.js` serves `dist/client`, loads the server bundle, and injects canonical/meta/schema/robots/404 behavior using `src/lib/seo/*`.
- `server/index.js` also owns the live security headers, including the production `Content-Security-Policy` allowlists for analytics, Supabase, Mapbox, Google reCAPTCHA, and similar third-party origins.
- `index.html` contains the pre-hydration theme resolver plus a consent-gated analytics bootstrap. GTM, GA4, and Mixpanel scripts are injected only by `window.__loadAnalytics()`, which runs by default (opt-out model) for visitors outside the EU/EEA/UK unless they opted out; EU/EEA/UK visitors (timezone heuristic) must opt in first. Do Not Sell and GPC do not gate analytics. If you touch head behavior, inspect this file.

## High-Value Route Areas
- Marketing/public pages:
  - `HomePage`, `AboutPage`, `HowItWorksPage`, `ContactUsPage`, legal pages
- Discovery and search:
  - `ExplorePage` is the main browse/map/list/hybrid screen
  - `SearchResultsPage` handles NLP / AI search, category filters, advanced filters, and hybrid display
  - shared UI lives in `MapComponent`, `HybridView`, `FilterBar`, `SortDropdown`, `GearQuickFilterInput`, `components/map/*`
- Gear detail and listing SEO:
  - canonical route is `/gear/:gearSlug`
  - legacy route `/:category/:ownerSlug/:slug` still resolves and is canonicalized forward
  - main files are `EquipmentDetailPage.tsx`, `EquipmentDetailPageDb.tsx`, `components/equipment-detail/*`, `utils/gearUrl.ts`, `lib/seo/*`
  - `EquipmentDetailPageDb.tsx` includes a session-only "View Real Gear Images" action that calls the `google-image-search` edge function and temporarily swaps the carousel/modal image URLs without writing to `equipment_images`
  - Google image search results for gear must pass the shared high-resolution gear-image filter: HTTPS URLs, reported dimensions, landscape width >= 1200px or portrait height >= 1200px, and no obvious video/thumbnail/logo/banner/avatar/icon/poster metadata
- Profiles and owner surfaces:
  - `RealUserProfilePage.tsx` handles public vs own profile, profile editing, image upload, privacy settings, and equipment filtering
  - related UI is in `components/profile/*`
- Owner inventory flows:
  - `AddGearForm.tsx`, `EditGearForm.tsx`, `hooks/gear-form/*`, `hooks/useAddGearForm.ts`, `hooks/useEditGearForm.ts`
  - `MyEquipmentPage.tsx` manages equipment, map visibility, and widget feed sync
  - `LightspeedPOSPage.tsx` is currently a semi-mock integration surface
- Blog / CMS:
  - `BlogPage`, `BlogPostPage`, `BlogCreatePage`, `BlogEditPage`, `MyDraftsPage`
  - dynamic data lives in `blog_posts`; static posts live in `src/lib/blog/*`
  - service entrypoint is `src/services/blogService.ts`
  - rendering helpers live in `components/blog/*`
  - weekly automated gear-review drafts are created by the `generate-gear-review-blog-draft` edge function; it writes draft `blog_posts` only and records hidden evidence in `gear_review_blog_generation_runs`
- Demo events:
  - `DemoCalendarPage.tsx` and `DemoEventPage.tsx`
  - client hook is `src/hooks/useDemoEvents.ts`
  - slug and presentation helpers live in `src/utils/eventSlug.ts` and `src/utils/demoEventPresentation.ts`
- Quiz:
  - `GearQuizPage.tsx`
  - UI lives in `components/quiz/*`
  - validation/resolution helpers live in `src/utils/quiz*`
  - AI result generation uses the `gear-quiz-analysis` edge function
- Admin:
  - `AdminPage.tsx`
  - major tools live in `src/components/admin/*`
  - includes user creation/directory, image/media upload, demo event management, retailer discovery, broken image scanning, manual gear-review blog draft generation, blog generation, and geocoding recovery
- Widget and external feeds:
  - `src/components/DemoStokeWidget.tsx` currently hardcodes a localhost iframe and is not production-ready
  - external shop feed ingestion centers on `shopGearFeedService.ts`, `shopGearSyncService.ts`, `shopGearFeedMappingService.ts`, and `shop_gear_feed_mappings`
- Placeholder / mock areas:
  - `AnalyticsPage.tsx` reads from `src/lib/mockAnalyticsData.ts`
  - `BookingsPage.tsx` reads from `src/lib/mockBookings.ts`
  - `PrivatePartyPage.tsx` is mock-data driven

## Directory Map
- `src/pages/` route-level screens
- `src/components/` reusable UI grouped by feature
- `src/components/ui/` shadcn / Radix primitives; keep edits conservative here
- `src/hooks/` query hooks, page hooks, gear-form hooks, auth/profile helpers
- `src/services/` client-side domain services
- `src/utils/` lower-level helpers: SEO slugs, filters, geocoding, uploads, quiz logic, text similarity
- `src/lib/` static blog content, SEO helpers, mock data, web vitals
- `src/contexts/` auth, theme, favorites, geolocation, SSR page data
- `src/theme/` theme provider and storage helpers
- `server/` Express SSR server
- `supabase/functions/` edge functions
- `supabase/migrations/` schema history
- `src/integrations/supabase/types.ts` is the generated schema map
- `.github/workflows/ci.yml` is the CI contract; `.github/workflows/security.yml` runs secret scanning and dependency audit checks
- `.kiro/specs/` contains planning artifacts, not runtime code

## Core Data Model
- Primary tables:
  - `equipment`, `equipment_images`, `pricing_options`, `equipment_reviews`, `equipment_views`
  - `profiles`, `public_profiles`, `user_roles`
  - `blog_posts`
  - `gear_review_blog_generation_config`, `gear_review_blog_generation_runs`
  - imported FleetOps tables: `fleetops_shops`, `fleetops_shop_viewers`, `fleetops_user_roles`, `fleetops_equipment`, `fleetops_equipment_images`, `fleetops_pricing_options`, `fleetops_add_ons`, `fleetops_bookings`, `fleetops_pos_connections`, `fleetops_lightspeed_inventory_items`, `fleetops_booqable_inventory_items`, `fleetops_pos_inventory_seed_runs`, `fleetops_pos_inventory_seed_config`
  - `demo_calendar`, `demo_event_candidates`, `demo_event_discovery_config`
  - `app_settings`, `app_privacy_settings`
  - `shop_gear_feed_mappings`, `scraped_retailers`, `downloaded_images`
  - the old separate design-system database is not part of this linked project
- Durable schema/type source for agents is `src/integrations/supabase/types.ts`. If migrations change tables or RPCs, update that type file and this memory.
- Public marketplace reads often flow through `getEquipmentData()` in `src/services/equipment/equipmentDataService.ts`, which can switch between Supabase and an external shop feed.

## Supabase Data API Grants (new tables only)

Starting Oct 30, 2026, new tables in `public` are not auto-exposed to the Data API (supabase-js / PostgREST / GraphQL). Existing tables are grandfathered — no retroactive migration is needed.

Any new `CREATE TABLE public.<name>` migration must include explicit grants in the same file, e.g.:

```sql
grant select, insert, update, delete on public.<name> to authenticated;
grant select, insert, update, delete on public.<name> to service_role;
grant select on public.<name> to anon;  -- only if anon should read it

alter table public.<name> enable row level security;
-- ... policies ...
```

If a grant is missing, PostgREST returns error code `42501` with the exact GRANT statement needed.

## Supabase Migration Reconciliation

- The linked DemoStoke project is `qtlhqsqanbxgfbcjigrl`.
- On May 21, 2026, linked migration metadata was repaired: legacy `001` through `011` entries were marked reverted, timestamped local migrations through `20260520010000` were marked applied, and already-applied Hermes seed migrations for Park City, Arizona, Oregon, Colorado, Ventura County, and Texas were copied into this repo and marked applied. Migration history has 240 timestamped entries and is aligned through `20260520232100`.
- Before running migration-history-driven commands, run `supabase migration list --linked`; it should show local and remote aligned except for intentionally new local migrations.
- On June 11, 2026, the already-applied FleetOps seed migrations `20260608140000_seed_fleetops_guest_viewer.sql` and `20260608150000_seed_fleetops_admin_roles.sql` were copied from the `demostoke-fleet-ops` repo into this repo (same pattern as the Hermes reconciliation) so `supabase db push` history stays aligned. They are already applied to the linked project; `db push` skips them.
- The `demostoke-fleet-ops` repo links to this same Supabase project. Never run `supabase config push` from that repo: its `supabase/config.toml` auth section (`enable_signup = false`, `site_url = "https://widget.demostoke.com"`) would overwrite the shared project's auth configuration, disabling DemoStoke self-signup and redirecting auth emails. That file is local-dev-only documentation; FleetOps invite-only enforcement belongs at the `fleetops_user_roles` level.
- If historical drift reappears, do not apply local migrations to the linked DB just because they appear local-only. First verify whether the intended schema/data already exists. For data-only seed work, use the rollback-first transaction pattern documented in `supabase/MIGRATION_RECONCILIATION.md`.
- After changing any file under `supabase/migrations/` or `supabase/functions/`, you MUST explicitly tell the user that those migration or Edge Function changes have not been pushed/deployed to the linked Supabase project, unless you actually pushed or deployed them in the same turn. Do not let local Supabase changes sound live.

## Supabase Edge Function Inventory
- Search / AI:
  - `ai-search`
  - `generate-description`
  - `generate-tricks`
  - `gear-quiz-analysis`
  - `google-web-search`
  - `google-image-search`
  - `youtube-tutorial-search`
- Blog / SEO:
  - `generate-blog-post`
  - `generate-blog-text`
  - `generate-gear-review-blog-draft`
  - `analyze-blog-seo`
  - `site-keyword-check`
- Admin / profile / utilities:
  - `admin-create-user`
  - `get-user-display-role`
  - `set-user-display-role`
  - `send-contact-email`
  - `verify-recaptcha`
  - `get-mapbox-token`
  - `scan-broken-images`
  - `download-store-image`
  - `convert-image-to-webp`
  - `convert-to-jpeg`
  - `auto-assign-gear-images`
- Discovery / ingestion:
  - `discover-demo-events`
  - `rental-discovery-agent`
  - `crawl-retailer-details`
  - `extract-gear-from-html`
  - `insert-equipment-from-sql`
- Imported FleetOps:
  - `fleetops-admin-create-shop`
  - `fleetops-ai-analytics`
  - `fleetops-create-payment-intent`
  - `fleetops-refund-payment`
  - `fleetops-send-booking-email`
  - `fleetops-shop-gear-feed`
  - `fleetops-stripe-webhook`
  - `fleetops-seed-pos-inventory`

## Env and Integration Surface
- Browser/public runtime uses `VITE_SUPABASE_URL` plus `VITE_SUPABASE_PUBLISHABLE_KEY` or `VITE_SUPABASE_ANON_KEY` when provided, and otherwise falls back to checked-in values in `src/integrations/supabase/config.js` for the Supabase URL and publishable key.
- Server SSR metadata enrichment uses `VITE_SUPABASE_URL` plus `VITE_SUPABASE_PUBLISHABLE_KEY` or `VITE_SUPABASE_ANON_KEY`.
- Shop feed flags live in:
  - `VITE_USE_SHOP_GEAR_FEED`
  - `VITE_SHOP_GEAR_FEED_URL`
  - `VITE_SHOP_GEAR_FEED_SHOP_SLUG`
  - `VITE_SHOP_GEAR_FEED_START`
  - `VITE_SHOP_GEAR_FEED_END`
  - `VITE_SHOP_GEAR_FEED_INCLUDE_HIDDEN`
  - `VITE_SHOP_GEAR_FEED_APIKEY`
- Theme flicker fix can be disabled with `VITE_ENABLE_THEME_FLICKER_FIX=false`.

### Where Secrets Actually Live

There are five distinct stores. Do not assume the root `.env` is the app's config.

1. **Root `.env` (gitignored) - local tooling only, not read by app code.** Holds `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `SUPABASE_ACCESS_TOKEN` (Supabase CLI), and `MIXPANEL_SA_USERNAME` / `MIXPANEL_SA_SECRET` (Mixpanel service account for API/agent access). None carry a `VITE_` prefix, so Vite never exposes them and the SSR server never reads them. It is the only env file in the tree; there is no `.env.example`.
2. **Supabase Edge Function secrets** (`supabase secrets set`, or the dashboard) - the real secret store. See the full inventory below.
3. **Hardcoded public keys in the repo** - `src/integrations/supabase/config.js` (project URL + anon JWT), `index.html` (Mixpanel project token, `GTM-MHM2XTTV`, `G-KKQJ9P2ECC`), and `src/components/Recaptcha.tsx` (`RECAPTCHA_SITE_KEY`). All are public-by-design client keys. Never add a private key to these files.
4. **The database** - Supabase Vault secret `auto_assign_internal_secret`, plus `gear_review_blog_generation_config.cron_secret` and `fleetops_pos_inventory_seed_config.cron_secret`.
5. **The SSR host** - the `VITE_*` vars the client and `server/index.js` read are set in whatever platform runs `npm start`. There is no hosting config in this repo (no `vercel.json`, `netlify.toml`, `Dockerfile`, or `fly.toml`), so that configuration lives outside the codebase.

CI holds no repository secrets; `.github/workflows/security.yml` uses only the auto-provided `secrets.GITHUB_TOKEN`.

- Edge function secret inventory, by area:
  - Supabase (auto-injected into every function): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`
  - AI: `OPENAI_API_KEY`, `GEAR_REVIEW_BLOG_MODEL` (model id override, not a credential)
  - Google: `GOOGLE_API_KEY`, `GOOGLE_CSE_ID`, `GOOGLE_SEARCH_API_KEY`, `GOOGLE_SEARCH_ENGINE_ID`, `GOOGLE_RECAPTCHA_SECRET_KEY`, `YOUTUBE_V3_API_KEY`
  - Maps: `MAPBOX_TOKEN` (used by `get-mapbox-token` and `admin-create-user`)
  - Crawling: `FIRECRAWL_API_KEY` (`rental-discovery-agent`, `discover-demo-events`, `crawl-retailer-details`)
  - Email: `RESEND_API_KEY` (`send-contact-email`)
  - Internal auth: `AUTO_ASSIGN_INTERNAL_SECRET`
  - FleetOps: see the prefixed list below
- `HCAPTCHA_SECRET` and `HCAPTCHA_SITE_KEY` are legacy and no longer read by any function. `AUTH_SEND_EMAIL_HOOK_SECRET`, `DS_DESIGN_SYSTEM_TOKEN` (design-system tables were dropped in `20260608120000`), `HUGGING_FACE_ACCESS_TOKEN`, and `LOVABLE_API_KEY` are also set on the linked project but unreferenced in this repo. Leave them alone unless the user explicitly asks to prune them.
- The client never receives the Mapbox token as an env var. It calls the `get-mapbox-token` edge function, which reads `MAPBOX_TOKEN` server-side. Keep it that way.
- To audit what is actually set on the linked project, run `supabase secrets list` (prints names and value digests, never plaintext).
- `generate-gear-review-blog-draft` also relies on `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, and the Google Custom Search image/web keys. It is protected by the `gear_review_blog_generation_config.cron_secret` value passed as `x-cron-secret`, compared in constant time via `_shared/timingSafeEqual.ts`.
- `auto-assign-gear-images` is no longer anonymous. It now requires either an admin JWT or a shared internal secret `AUTO_ASSIGN_INTERNAL_SECRET` passed as the `x-internal-secret` header. The `on_equipment_created` DB trigger (`notify_new_equipment`) sends that header, reading the value from the Vault secret named `auto_assign_internal_secret` (migration `20260611120000_auto_assign_secret_vault_fallback.sql`), falling back to the `app.auto_assign_internal_secret` GUC. Persisting custom GUCs via `ALTER DATABASE/ROLE ... SET` is denied on Supabase managed Postgres, which is why Vault is the primary source. Keep the Vault secret and the function secret set to the same value.
- SSRF-prone image/fetch functions (`download-store-image`, `convert-image-to-webp`, `convert-to-jpeg`, `scan-broken-images`) validate user/DB-supplied URLs through `_shared/urlSafety.ts`, which requires https and rejects private/reserved hosts.
- Imported FleetOps storage uses public buckets `fleetops-equipment-images` and `fleetops-shop-logos`.
- Imported FleetOps Edge Functions read `FLEETOPS_`-prefixed secrets exclusively: `FLEETOPS_STRIPE_SECRET_KEY`, `FLEETOPS_STRIPE_WEBHOOK_SECRET`, `FLEETOPS_SENDGRID_API_KEY`, `FLEETOPS_FROM_EMAIL`, `FLEETOPS_PUBLIC_SUPABASE_URL`, and `FLEETOPS_POS_INVENTORY_SEED_CRON_SECRET`. The unprefixed fallbacks (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SENDGRID_API_KEY`, `FROM_EMAIL`, `PUBLIC_SUPABASE_URL`, `SITE_URL`, `POS_INVENTORY_SEED_CRON_SECRET`, `SERVICE_ROLE_KEY`) were removed in August 2026; they were never set on the linked project, so they were dead code that made the real source of each value ambiguous. Do not reintroduce them. `FLEETOPS_FROM_EMAIL` is intentionally optional and defaults to `bookings@demostoke.com`.
- The retained `fleetops_pos_inventory_seed_config.cron_secret` should stay synchronized with `FLEETOPS_POS_INVENTORY_SEED_CRON_SECRET` if the disabled seed flow is ever re-enabled.
- Do not introduce new hardcoded secrets. Keep public browser tokens and service secrets clearly separated.

## Critical Invariants and Gotchas
- Category ordering for client UI comes from `GEAR_CATEGORIES` in `src/lib/gearCategories.ts` (surfboards, snowboards, skis, mountain-bikes). Nav menus, the hero category row, `FilterBar`, the quiz `CategorySelection`, blog filters and category selects (`BLOG_CATEGORIES`, lowercase labels such as `mountain bikes`), the demo-calendar filters (`CATEGORY_META` key order in `demoEventPresentation.ts`) and `AddEventModal` (defaults to `surfboards`), the map legend, the admin demo-events select, `UserContactFields`, and the profile category dropdown (`sortByGearCategoryOrder`) all follow it. `DemoEvent`/`DemoEventCandidate` category types use `GearCategorySlug`. Do not reintroduce hand-written four-category lists in components. Hand-ordered copies that must stay in the same order: `GearBasicInfo` (singular form values), `PUBLIC_GEAR_CATEGORIES` in `src/lib/seo/gearSeo.js`, `DEMO_EVENT_CATEGORY_LABELS` in `publicMetadata.js`, and the Deno edge functions (`ELIGIBLE_GEAR_CATEGORIES`, `ALLOWED_GEAR_CATEGORIES`, discovery defaults).
- Explore falls back to Santa Monica Bay (`DEFAULT_EXPLORE_COORDINATES` in `src/utils/locationDefaults.ts`) when geolocation is denied. The gear quiz opens with `surfboards` preselected.
- The weekly `generate-gear-review-blog-draft` cron picks its category with `chooseRandomCategory` in `_shared/gearReviewBlogGeneration.ts`, weighted by `SURF_CATEGORY_WEIGHT` (0.5) toward surfboards and split evenly across the rest; `shuffleCategories` still provides fallback order. `discover-demo-events` lists surfboards first and interleaves its search queries round-robin across categories, because `MAX_QUERY_ATTEMPTS` (6) is smaller than the number of variants generated per search term.
- SEO changes usually require edits in both client metadata (`usePageMetadata`) and server injection (`server/index.js` + `src/lib/seo/*`). Do not fix only one side.
- Canonical gear URLs should go through `utils/gearUrl.ts`. When route shape changes, update route definitions, server SEO handling, and SEO tests together.
- Detail-page visibility rules depend on `isPublicEquipmentRecord()` and hidden-user handling. Check both `useEquipmentById` and `useEquipmentBySlug`.
- Multi-image behavior prefers `equipment_images` / `all_images`; many components assume the primary image is `images[0]`, not a legacy single `image_url`.
- `AuthProvider` syncs favorites and recently viewed items from localStorage into Supabase on sign-in; browser-only storage assumptions matter.
- The theme system is split between `index.html` and `src/theme/*`; if you change theme startup behavior, keep both in sync.
- All analytics (GTM, GA4, Mixpanel incl. session replay) are consent-gated: US-style opt-out (default on) for visitors outside GDPR territories, opt-in (default off) for EU/EEA/UK/CH visitors detected via the free timezone heuristic `isEuVisitor()` (`Europe/*` plus the EU Atlantic island zones; duplicated in the `index.html` bootstrap — keep in sync). Effective consent is `stored ? stored.analytics : !isEuVisitor()`. The "Do Not Sell or Share My Information" preference (`doNotSell`) is INDEPENDENT of analytics and ON by default: DemoStoke does not sell or share data (analytics is internal-use only, a deliberate product decision, July 2026), so `doNotSell` and GPC signals record the CPRA opt-out but never disable analytics. Scripts load only via `window.__loadAnalytics()` in the `index.html` bootstrap (Mixpanel via the official embed snippet + `mixpanel.init`, token hardcoded there, autocapture with URL-change pageviews, 100% session replay, and replay heatmap capture); ordinary page text is visible in replays, all form inputs stay globally masked, and displayed profile contact data uses focused `.mp-mask`/`.mp-block` redaction. Consent state lives in `src/utils/cookieConsent.ts` (`cookie-consent` key, versioned via `CONSENT_VERSION` — bump it to re-prompt everyone, localStorage + cookie mirror). Opt-out calls `mixpanel.opt_out_tracking()` and sweeps `mp_*`/legacy `AMP_*` cookie and localStorage state. The banner is `src/components/CookieConsentBanner.tsx` (mounted via `ClientOnlyCookieConsent` in `App.tsx`; reopened from the Footer's "Cookie Settings" and "Do Not Sell or Share My Information" buttons and a link on the Privacy Policy page). `trackEvent`, `GoogleTagManager`, and both `vitals` senders all guard on `hasAnalyticsConsent()` so opted-out events never enter the dataLayer queue (GTM replays it on late load). Never add analytics scripts directly to `index.html` or push to `dataLayer` without a consent check. Analytics identity is UUID-only: `identifyUser()` in `src/utils/tracking.ts` sends the Supabase user UUID on sign-in/restore and `resetAnalyticsIdentity()` runs on real sign-out (wired in `AuthContext`); never send email, name, or other PII people-profile props to Mixpanel. The `cookie-consent` key/version literals and the default-allowed logic are duplicated between `index.html` and `cookieConsent.ts` — keep them in sync.
- Search/explore/profile visibility behavior is tightly coupled to `equipmentDataService`, `searchService`, `useEquipmentWithDynamicDistance`, and advanced filter helpers.
- The sign-in page runs invisible reCAPTCHA with the floating Google badge hidden (`hideBadge` prop on `src/components/Recaptcha.tsx`). Google only allows hiding the badge when the disclosure text is shown instead, so keep `hideBadge` paired with `RecaptchaDisclosure` on any form that uses it.
- Automated gear-review drafts must not create `equipment_reviews` rows or mutate `equipment.rating` / `equipment.review_count`. Hidden factual evidence belongs in `gear_review_blog_generation_runs.hidden_evidence`, not in public blog copy, tags, excerpts, or analytics payloads.
- Cron-generated gear-review drafts use the evergreen model-review prompt `Write a comprehensive evergreen product review of the [gear brand/model] [category]`. Drafts should read like standalone product reviews, not listing, rental, shop, travel, or local availability pages. They must not use listing metadata such as owner/shop details, pickup or booking details, listing locations, city/state/region copy, daily or weekly rates, rental prices, dollar amounts, or rate structures in public copy. They must include category-specific review structure such as design/construction, ride/use profile, natural language headings like `Who it's for` instead of `Who it is for`, setup guidance, strengths, tradeoffs, care/tuning, and a final `<h2>Final Call</h2>` section with a natural relative `/gear/...` link to the reviewed DemoStoke gear detail page. Draft tags must be exactly the post category, gear category, and brand, for example `gear reviews`, `skis`, `stockli`. The generator must deterministically normalize Final Thoughts/Verdict style headings to Final Call, normalize formal `Who it is for` phrasing to `Who it's for`, and insert that gear-detail link before saving if the model omits it. They must not use em dashes in public copy, must target about 1200 visible body words after stripping HTML tags with a 1000-1400 word guardrail, and must store a selected gear image URL for the blog thumbnail instead of a small Google `thumbnailLink`.
- As of June 8, 2026, FleetOps has been imported into the main DemoStoke project with prefixed `fleetops_` tables, `fleetops-` storage buckets, and `fleetops-` Edge Functions. The old main cron job `fleetops-pos-inventory-seed-2am-pt` was unscheduled, `fleetops_pos_inventory_seed_config.enabled` is false, and `trigger_fleetops_pos_inventory_seed_cron(boolean)` was dropped. Do not recreate the old cron or post to the separate FleetOps project unless the user explicitly requests it.
- Generated gear-review analytics must use safe metadata only: post id/slug, category, source equipment id, gear category, author, generated flag, and preview/published mode. Never send hidden evidence, source snippets, credentials, or raw prompts to Mixpanel or Google Analytics.
- `DemoStokeWidget` is a local-dev artifact right now. Treat it as unfinished unless you intentionally wire it to production.
- There is a large amount of existing debug logging. Remove or preserve it intentionally, not accidentally.
- Vite 8 uses Rolldown build options. Do not add object-form `manualChunks`; it is unsupported and breaks client builds.

## Canonical Category Image URLs (Pexels)

Use these URLs when seeding equipment_images rows. Primary = display_order 0, is_primary true. Secondary = display_order 1, is_primary false.

| Category       | Role      | URL |
|----------------|-----------|-----|
| skis           | primary   | https://images.pexels.com/photos/848699/pexels-photo-848699.jpeg |
| skis           | secondary | https://images.pexels.com/photos/36084973/pexels-photo-36084973.jpeg |
| snowboards     | primary   | https://images.pexels.com/photos/7406683/pexels-photo-7406683.jpeg |
| snowboards     | secondary | https://images.pexels.com/photos/7166118/pexels-photo-7166118.jpeg |
| mountain-bikes | primary   | https://images.pexels.com/photos/30447388/pexels-photo-30447388.jpeg |
| mountain-bikes | secondary | https://images.pexels.com/photos/25753440/pexels-photo-25753440.jpeg |
| surfboards     | primary   | https://images.pexels.com/photos/2370006/pexels-photo-2370006.jpeg |
| surfboards     | secondary | https://images.pexels.com/photos/8907535/pexels-photo-8907535.jpeg |

Do not substitute other image sources for seed data. If new categories are added, append rows here before writing SQL.

## Test and Review Expectations
- CI runs `npm run lint`, `npm run type-check`, `npm run build`, and `npm run test:unit`.
- Unit tests live under `src/__tests__/` and focus heavily on SEO, SSR/server behavior, map/hybrid filtering, quiz resolution, and related regressions.
- If you change routing, SEO, SSR, schema, or public discovery behavior, run the most relevant local checks and update tests when behavior changed intentionally.
- Before finishing a code change, re-check whether this file needs an update.
- Before finishing any work session, kill every process you started (dev servers, preview servers, background builds, watchers) and verify their ports are free (e.g. `lsof -i :<port>`). Never leave processes running for the user to hunt down. Never kill processes you did not start, such as the user's own dev server.

## Seed Data — Schema Gotchas (equipment table)

- `specs` does **not exist** as a column in `public.equipment`. Never reference it in INSERT, UPDATE, or temp table definitions. Put spec details (frame material, travel, drivetrain, fork, wheelset) in the `description` field as prose.
- `size` is plain text. It must contain **only comma-separated size names** — e.g., `Small, Medium, Large, XL`. Never put spec strings, dimensions, or wheel-size notes in this field. Normalize: `X-Large` → `XL`, `X-Small` → `XS`, `SM/MED/LG` → `Small/Medium/Large`; omit `X-Medium` and `XX-Large`.

## Seed Data — Currency

- Store foreign-shop rental prices in the shop country's source currency, never silently converted or assumed as U.S. dollars. `equipment.price_per_day`, `price_per_hour`, and `price_per_week` remain numeric source-native amounts, and `equipment.currency_code` must be the uppercase ISO 4217 code used for display and SEO. Examples: Mexico shops use `MXN`, Canada shops use `CAD`, and U.S. shops use `USD`.
- Seed SQL, extraction output, and POS/shop-feed imports must include `currency_code` for every gear row. Default to `USD` only when the source shop is in the United States or the source currency is genuinely absent after review; do not leave foreign rows as implicit USD.
- Batch audit files must document the source currency and price basis. If a foreign shop publishes prices without an explicit currency symbol/code, infer from the shop country only when that is defensible and record the inference.

## Seed Data — Current Seeded Shops

This summary reflects read-only linked DemoStoke data checks after the June 7, 2026 Central and South America surfboards follow-up seed apply. The Wax Bench row is an existing live profile retargeted by the Canada batch; its gear count is the current profile count after 17 inserts and 11 updates, not a newly created shop.

| # | Shop | Region | Category | Gear | Status |
|---|---|---|---|---|---|
| 1 | Olympic Bike Shop | Lake Tahoe, CA | mountain-bikes | 8 | applied |
| 2 | Hawaii Surfboard Rentals | Waikiki, HI | surfboards | 18 | applied |
| 3 | Jans Mountain Outfitters | Park City, UT | skis | 24 | applied |
| 4 | White Pine Touring | Park City, UT | mountain-bikes | 2 | applied |
| 5 | Park City Sport | Park City, UT | skis + snowboards | 0 | profile applied; no current gear |
| 6 | Fair Wheel Bikes | Tucson, AZ | mountain-bikes | 4 | applied |
| 7 | Bike Emporium | Scottsdale, AZ | mountain-bikes | 1 | applied |
| 8 | Thunder Mountain Bikes | Sedona, AZ | mountain-bikes | 23 | applied |
| 9 | McDowell Mountain Cycles | Fountain Hills, AZ | mountain-bikes | 2 | applied |
| 10 | Cog Wild Bend | Bend, OR | mountain-bikes | 2 | applied |
| 11 | Cog Wild Oakridge | Oakridge, OR | mountain-bikes | 5 | applied |
| 12 | Sunnyside Sports | Bend, OR | mountain-bikes | 7 | applied |
| 13 | Venture Sports Avon | Avon, CO | skis + snowboards + mountain-bikes | 18 | applied |
| 14 | Bentgate Mountaineering | Golden, CO | skis | 15 | applied |
| 15 | Cripple Creek Bike and Backcountry Aspen | Aspen, CO | mountain-bikes | 2 | applied |
| 16 | Walden Surfboards | Ventura, CA | surfboards | 4 | applied |
| 17 | Spider Mountain Bike Park | Burnet, TX | mountain-bikes | 6 | applied |
| 18 | GearHub Sports | Fernie, BC | mountain-bikes + snowboards | 8 | applied |
| 19 | Coastal Culture Sports | Whistler, BC | mountain-bikes | 3 | applied |
| 20 | Whistler Sports Rentals | Whistler, BC | mountain-bikes | 5 | applied |
| 21 | Cross Country Connection | Whistler, BC | mountain-bikes + skis | 9 | applied |
| 22 | Big White Bike Park | Big White, BC | mountain-bikes | 2 | applied |
| 23 | Dialed In Cycling | Squamish, BC | mountain-bikes | 6 | applied |
| 24 | Essential Cycles | North Vancouver, BC | mountain-bikes | 4 | applied |
| 25 | Lynn Valley Bikes | North Vancouver, BC | mountain-bikes | 2 | applied |
| 26 | Cycle BC Vancouver | Vancouver, BC | mountain-bikes | 2 | applied |
| 27 | Trail Bicycles | Courtenay, BC | mountain-bikes | 5 | applied |
| 28 | Mont-Sainte-Anne Sports Alpins | Beaupre, QC | mountain-bikes | 6 | applied |
| 29 | Vallee Bras-du-Nord Shannahan | Saint-Raymond, QC | mountain-bikes | 3 | applied |
| 30 | The Wax Bench | Revelstoke, BC | skis + snowboards | 48 | existing profile retargeted; applied |
| 31 | Belleayre Mountain | Highmount, NY | skis + snowboards | 7 | applied |
| 32 | Highland Mountain Bike Park | Northfield, NH | mountain-bikes | 8 | applied |
| 33 | Thunder Mountain Bike Park | Charlemont, MA | mountain-bikes | 8 | applied |
| 34 | Ride Kanuga | Hendersonville, NC | mountain-bikes | 3 | applied |
| 35 | REAL Watersports | Waves, NC | surfboards | 5 | applied |
| 36 | Warm Winds Surf Shop | Narragansett, RI | surfboards | 3 | applied |
| 37 | Cinnamon Rainbows Surf Co. | North Hampton, NH | surfboards | 6 | applied |
| 38 | Hawaiian South Shore | Honolulu, HI | surfboards | 15 | applied |
| 39 | Clips Hawaii | Honolulu, HI | surfboards | 39 | applied |
| 40 | Haleiwa Surf Shop | Haleiwa, HI | surfboards | 29 | applied |
| 41 | Kauai Surfboard Rentals | Hanalei, HI | surfboards | 121 | applied |
| 42 | Hanalei Surfboard Rentals | Hanalei, HI | surfboards | 31 | applied |
| 43 | Maui Sunriders Kihei Bike Shop | Kihei, HI | mountain-bikes | 2 | applied |
| 44 | Maui Sunriders Kapalua Bike Shop | Lahaina, HI | mountain-bikes | 4 | applied |
| 45 | Bike Maui | Haiku, HI | mountain-bikes | 3 | applied |
| 46 | Big Island Bike Tours | Waimea, HI | mountain-bikes | 3 | applied |
| 47 | Dan Bailey's Outdoor Co. | Livingston, MT | mountain-bikes | 2 | applied |
| 48 | proVelo Bicycles | Fort Collins, CO | mountain-bikes | 6 | applied |
| 49 | Habitat Dirt + Snow Grand Targhee | Alta, WY | mountain-bikes | 2 | applied |
| 50 | Village Ski Shop | Angel Fire, NM | skis + snowboards | 20 | applied |
| 51 | Arizona Snowbowl Agassiz Pro Shop | Flagstaff, AZ | skis + snowboards | 20 | applied |
| 52 | Deer Valley Resort Ski Rentals | Park City, UT | skis | 6 | applied |
| 53 | Hi Tempo | White Bear Lake, MN | skis | 22 | applied |
| 54 | Surf Mexico | Bucerias, Nayarit | surfboards | 8 | applied |
| 55 | BikeFlow Oaxaca | Oaxaca, Oaxaca | mountain-bikes | 5 | applied |
| 56 | Bike Denali | Denali Park, AK | mountain-bikes | 1 | applied |
| 57 | Dismount Bike Shop | Toronto, ON | mountain-bikes | 3 | applied |
| 58 | Willi's Ski and Board Seven Springs | Champion, PA | skis | 10 | applied |
| 59 | Tactics Bend | Bend, OR | snowboards | 10 | applied |
| 60 | MTB Guatemala | Tecpan, Guatemala | mountain-bikes | 9 | applied |
| 61 | Bike Arenal | La Fortuna, Costa Rica | mountain-bikes | 3 | applied |
| 62 | Nosara MTB | Nosara, Costa Rica | mountain-bikes | 4 | applied |
| 63 | Buen Camino Bike Park | San Mateo, Costa Rica | mountain-bikes | 1 | applied |
| 64 | Line Up Surf Shop | Coronado, Panama | surfboards | 22 | applied |
| 65 | Santa Catalina Surf Shop | Santa Catalina, Panama | surfboards | 2 | applied |
| 66 | Sunzal Surf Company | El Tunco, El Salvador | surfboards | 36 | applied |
| 67 | Nosara Surfboards | Nosara, Costa Rica | surfboards | 9 | applied |
| | **Total** | | | **732** | |

Do not re-seed any shop already in this table. Do not seed Hawaii Surfboard Rentals under any Hawaii discovery task.

## Seed Data — Pending Local Seed Batches

There are currently no pending local seed batches. Any seed migration listed under `supabase/migrations/` is applied to the linked project (verified via `supabase migration list --linked`).

- The Eastern Time Zone all-category batch (migrations `20260530120000` through `20260530120400`, audit folder `demostoke_seed_batches/eastern_time_zone_all_categories/`) was applied to the linked project; verified June 11, 2026 via `supabase migration list --linked` and read-only profile checks. Its shops appear in the Current Seeded Shops table above.

## Seed Data — Historical Hermes Migration Notes

The final-state Hermes seed migrations for Park City/Jans/White Pine, Arizona, Oregon, Colorado, Ventura County, and Texas are now tracked under `supabase/migrations/` and marked applied in linked migration metadata. Do not apply them again to linked data.

These Hermes-only files were intentionally not imported:
- `20260511120100_seed_park_city_utah_gear.sql` — old package/Park City Sport gear state that is not present in linked data.
- `20260512100100_seed_jans_mountain_outfitters_gear.sql` — old 5-row Jans package seed replaced by `20260512110000_replace_jans_gear_granular.sql`.
- `20260512130100_seed_arizona_mountain_bikes_gear.sql` — superseded stub with the same timestamp as the real Fair Wheel Bikes gear migration.

## Seed Data — Rejected / Future Candidates (Arizona batch)

Documented in `demostoke-gear-adder/demostoke_seed_batches/arizona_mountain_bikes/rejected_candidates.md`. Key entries:
- Absolute Bikes (Flagstaff + Sedona) — rental page shows policy only, no model names
- Earlybird Bikes Tucson — "Transition mountain bikes" only, no individual models
- Cosmic Cycles Flagstaff — page returned empty
- Flagstaff Bicycle Revolution — JS SPA at rentals.flagbikerev.com; mark for retry with Claude in Chrome
- Prescott, Show Low/Pinetop, Phoenix metro, Cave Creek — not yet researched
