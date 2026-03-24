# Bugfix Requirements Document

## Introduction

DemoStoke's website has stopped receiving organic search traffic from Google and other search engines. The root causes span several interconnected SEO issues: the static sitemap submitted to Search Console is stale and includes private/auth-gated pages; dynamic content (blog posts, gear listings, demo events) is missing from the sitemap due to broken build-time env var handling; demo event URLs are caught in a redirect chain; the site cannot be verified in Google Search Console; Core Web Vitals are unmonitored; and GA4 may not be receiving page view data if GTM is misconfigured. Together these issues reduce crawlability, indexability, and ranking signal quality.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the build process runs THEN the system generates a static `public/sitemap.xml` that omits all dynamic content (blog posts, gear listings, demo events) because `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are not available at build time and `generate-sitemap.js` silently skips dynamic routes

1.2 WHEN `generate-sitemap` is not included in the build script THEN the system deploys a stale `public/sitemap.xml` that is never updated with dynamic content

1.3 WHEN the static `public/sitemap.xml` is submitted to Google Search Console THEN the system exposes private and auth-gated URLs (`/profile`, `/my-gear`, `/analytics`, `/bookings`, `/admin`, `/list-your-gear/add-gear-form`, `/api/gear/search`) to search engine crawlers

1.4 WHEN a search engine crawler or user visits `/event/:eventSlug` or `/demo-calendar/event/:eventSlug` THEN the system issues a 301 redirect to `/demo-events/:eventSlug`, creating a redirect chain for URLs that may already be indexed or linked in the sitemap

1.5 WHEN Google Search Console attempts to verify site ownership THEN the system returns a 404 because no `google-site-verification*.html` file exists in `public/`

1.6 WHEN the application runs in production THEN the system does not report Core Web Vitals (LCP, INP, CLS) to any analytics endpoint because the `web-vitals` package is not installed

1.7 WHEN GTM is not configured to fire a GA4 tag THEN the system does not send page view events to GA4, resulting in no organic traffic data in GA4 reports

### Expected Behavior (Correct)

2.1 WHEN the build process runs THEN the system SHALL generate a complete `public/sitemap.xml` that includes all dynamic content (blog posts, gear listings, demo events) by fetching from Supabase at build time with properly injected env vars, or by delegating entirely to the runtime `/sitemap.xml` endpoint

2.2 WHEN the build script executes THEN the system SHALL run `generate-sitemap` as part of the build pipeline so the deployed sitemap is never stale

2.3 WHEN `public/sitemap.xml` is generated THEN the system SHALL exclude all private, auth-gated, and non-indexable URLs (`/profile`, `/my-gear`, `/analytics`, `/bookings`, `/admin`, `/list-your-gear/add-gear-form`, `/api/gear/search`)

2.4 WHEN a search engine crawler or user visits a demo event page THEN the system SHALL serve the page at a single canonical URL without redirect chains, with the sitemap, client-side routes, and server routes all using the same URL pattern

2.5 WHEN Google Search Console attempts to verify site ownership THEN the system SHALL serve the correct verification file from `public/` so ownership can be confirmed

2.6 WHEN the application runs in production THEN the system SHALL collect and report Core Web Vitals (LCP, INP, CLS) using the `web-vitals` package so performance regressions affecting rankings are visible

2.7 WHEN a page view occurs in the SPA THEN the system SHALL send a GA4 page view event either via a properly configured GTM GA4 tag or via a direct `G-` measurement ID, ensuring organic traffic is tracked in GA4

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a search engine crawler visits any public, non-auth-gated page THEN the system SHALL CONTINUE TO serve correct server-side meta tags and structured data (JSON-LD) for that page

3.2 WHEN a user visits a blog post, gear listing, or demo event page THEN the system SHALL CONTINUE TO receive correctly injected Open Graph and canonical meta tags from the SSR layer

3.3 WHEN a request arrives at the server for a non-www domain THEN the system SHALL CONTINUE TO issue a 301 redirect to the www domain

3.4 WHEN `robots.txt` is requested THEN the system SHALL CONTINUE TO disallow crawling of private routes and reference the sitemap URL correctly

3.5 WHEN GTM fires on any SPA route change THEN the system SHALL CONTINUE TO push `page_view` events to the dataLayer via `GoogleTagManager.tsx`

3.6 WHEN Amplitude tracking is initialized THEN the system SHALL CONTINUE TO track user events without interference from any SEO or GA4 changes
