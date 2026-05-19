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
- `server/index.js` also owns the live security headers, including the production `Content-Security-Policy` allowlists for analytics, Supabase, Mapbox, hCaptcha, and similar third-party origins.
- `index.html` contains the pre-hydration theme resolver plus GTM, GA4, and Amplitude script tags. If you touch head behavior, inspect this file.

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
  - includes user creation/directory, image/media upload, demo event management, retailer discovery, broken image scanning, blog generation, and geocoding recovery
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
  - `demo_calendar`, `demo_event_candidates`, `demo_event_discovery_config`
  - `app_settings`, `app_privacy_settings`
  - `shop_gear_feed_mappings`, `scraped_retailers`, `downloaded_images`
  - `design_system_*` and `figma_*` tables also exist
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
  - `analyze-blog-seo`
  - `site-keyword-check`
- Admin / profile / utilities:
  - `admin-create-user`
  - `get-user-display-role`
  - `set-user-display-role`
  - `send-contact-email`
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

## Env and Integration Surface
- Browser/public runtime falls back to checked-in values in `src/integrations/supabase/config.js` for the Supabase URL and publishable key.
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
- Edge functions rely on combinations of `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `MAPBOX_TOKEN`, `GOOGLE_API_KEY`, `GOOGLE_CSE_ID`, `GOOGLE_SEARCH_API_KEY`, `GOOGLE_SEARCH_ENGINE_ID`, and `HCAPTCHA_SECRET`.
- Do not introduce new hardcoded secrets. Keep public browser tokens and service secrets clearly separated.

## Critical Invariants and Gotchas
- SEO changes usually require edits in both client metadata (`usePageMetadata`) and server injection (`server/index.js` + `src/lib/seo/*`). Do not fix only one side.
- Canonical gear URLs should go through `utils/gearUrl.ts`. When route shape changes, update route definitions, server SEO handling, and SEO tests together.
- Detail-page visibility rules depend on `isPublicEquipmentRecord()` and hidden-user handling. Check both `useEquipmentById` and `useEquipmentBySlug`.
- Multi-image behavior prefers `equipment_images` / `all_images`; many components assume the primary image is `images[0]`, not a legacy single `image_url`.
- `AuthProvider` syncs favorites and recently viewed items from localStorage into Supabase on sign-in; browser-only storage assumptions matter.
- The theme system is split between `index.html` and `src/theme/*`; if you change theme startup behavior, keep both in sync.
- Search/explore/profile visibility behavior is tightly coupled to `equipmentDataService`, `searchService`, `useEquipmentWithDynamicDistance`, and advanced filter helpers.
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
| surfboards     | primary   | https://images.pexels.com/photos/36084973/pexels-photo-36084973.jpeg |
| surfboards     | secondary | https://images.pexels.com/photos/8907535/pexels-photo-8907535.jpeg |

Do not substitute other image sources for seed data. If new categories are added, append rows here before writing SQL.

## Test and Review Expectations
- CI runs `npm run lint`, `npm run type-check`, `npm run build`, and `npm run test:unit`.
- Unit tests live under `src/__tests__/` and focus heavily on SEO, SSR/server behavior, map/hybrid filtering, quiz resolution, and related regressions.
- If you change routing, SEO, SSR, schema, or public discovery behavior, run the most relevant local checks and update tests when behavior changed intentionally.
- Before finishing a code change, re-check whether this file needs an update.

## Seed Data — Schema Gotchas (equipment table)

- `specs` does **not exist** as a column in `public.equipment`. Never reference it in INSERT, UPDATE, or temp table definitions. Put spec details (frame material, travel, drivetrain, fork, wheelset) in the `description` field as prose.
- `size` is plain text. It must contain **only comma-separated size names** — e.g., `Small, Medium, Large, XL`. Never put spec strings, dimensions, or wheel-size notes in this field. Normalize: `X-Large` → `XL`, `X-Small` → `XS`, `SM/MED/LG` → `Small/Medium/Large`; omit `X-Medium` and `XX-Large`.

## Seed Data — Current Seeded Shops

Full canonical record is in `demostoke-gear-adder/seeded_shops_registry.md`. Summary here for quick reference.

| # | Shop | Region | Category | Gear | Status |
|---|---|---|---|---|---|
| 1 | Olympic Bike Shop | Lake Tahoe, CA | mountain-bikes | 19 | applied |
| 2 | Hawaii Surfboard Rentals | Waikiki, HI | surfboards | 22 | applied |
| 3 | Jans Mountain Outfitters | Park City, UT | skis | 24 | applied |
| 4 | White Pine Touring | Park City, UT | mountain-bikes | 2 | pending |
| 5 | Park City Sport | Park City, UT | skis + snowboards | 7 | pending |
| 6 | Fair Wheel Bikes | Tucson, AZ | mountain-bikes | 4 | pending |
| 7 | Bike Emporium | Scottsdale, AZ | mountain-bikes | 1 | pending |
| 8 | Thunder Mountain Bikes | Sedona, AZ | mountain-bikes | 23 | pending |
| 9 | McDowell Mountain Cycles | Fountain Hills, AZ | mountain-bikes | 2 | pending |
| | **Total** | | | **104** | |

Do not re-seed any shop already in this table. Do not seed Hawaii Surfboard Rentals under any Hawaii discovery task.

## Seed Data — Pending Migration Files (apply in order)

### park_city_utah batch
```
supabase db query --linked -f ".../migrations/20260511120000_seed_park_city_utah_shops.sql"
supabase db query --linked -f ".../migrations/20260511120100_seed_park_city_utah_gear.sql"
supabase db query --linked -f ".../migrations/20260512120000_seed_white_pine_touring_gear.sql"
```

### arizona_mountain_bikes batch
```
supabase db query --linked -f ".../migrations/20260512130000_seed_arizona_mountain_bikes_shops.sql"
supabase db query --linked -f ".../migrations/20260512130100_seed_fair_wheel_bikes_gear.sql"
supabase db query --linked -f ".../migrations/20260512130200_seed_bike_emporium_gear.sql"
supabase db query --linked -f ".../migrations/20260512130300_seed_thunder_mountain_bikes_gear.sql"
supabase db query --linked -f ".../migrations/20260512130400_seed_mcdowell_mountain_cycles_gear.sql"
```

Full absolute paths and apply order are in `demostoke-gear-adder/demostoke_seed_batches/arizona_mountain_bikes/remote_runbook.md`.

⚠️ `migrations/20260512130100_seed_arizona_mountain_bikes_gear.sql` is a superseded stub — do not apply it.

## Seed Data — Rejected / Future Candidates (Arizona batch)

Documented in `demostoke-gear-adder/demostoke_seed_batches/arizona_mountain_bikes/rejected_candidates.md`. Key entries:
- Absolute Bikes (Flagstaff + Sedona) — rental page shows policy only, no model names
- Earlybird Bikes Tucson — "Transition mountain bikes" only, no individual models
- Cosmic Cycles Flagstaff — page returned empty
- Flagstaff Bicycle Revolution — JS SPA at rentals.flagbikerev.com; mark for retry with Claude in Chrome
- Prescott, Show Low/Pinetop, Phoenix metro, Cave Creek — not yet researched
