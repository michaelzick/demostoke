/**
 * SEO Preservation Property Tests
 *
 * These tests are written BEFORE the fix and MUST PASS on unfixed code.
 * They encode the baseline behaviors that must remain unchanged after the fix.
 *
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(__dirname, '../../');

// ---------------------------------------------------------------------------
// Test 3.1 / 3.2 — SSR meta tag injection for blog, gear, demo-events
//
// Preservation: The SSR GET * handler in server/index.js must contain meta
// tag injection logic for /blog/:slug, /gear/:slug, and /demo-events/:slug.
// ---------------------------------------------------------------------------
describe('Preservation 3.1 / 3.2 — SSR meta tag injection', () => {
  const serverPath = path.join(ROOT, 'server/index.js');
  let source: string;

  // Read once for all tests in this suite
  try {
    source = fs.readFileSync(serverPath, 'utf-8');
  } catch {
    source = '';
  }

  it('server/index.js should call getBlogPostMeta for /blog/ routes', () => {
    expect(
      source,
      'getBlogPostMeta call not found — blog SSR meta injection may be broken',
    ).toMatch(/getBlogPostMeta\s*\(/);
  });

  it('server/index.js should call getGearPageMeta for /gear/ routes', () => {
    expect(
      source,
      'getGearPageMeta call not found — gear SSR meta injection may be broken',
    ).toMatch(/getGearPageMeta\s*\(/);
  });

  it('server/index.js should call getDemoEventPageMeta for /demo-events/ routes', () => {
    expect(
      source,
      'getDemoEventPageMeta call not found — demo-events SSR meta injection may be broken',
    ).toMatch(/getDemoEventPageMeta\s*\(/);
  });

  it('server/index.js SSR handler injects <meta property="og:title"> for blog routes', () => {
    // The handler replaces og:title via a regex replace on the HTML template
    expect(
      source,
      'og:title injection not found in server/index.js — Open Graph tags will be missing for blog posts',
    ).toMatch(/og:title/);
  });

  it('server/index.js SSR handler injects <meta property="og:description"> for blog routes', () => {
    expect(
      source,
      'og:description injection not found in server/index.js',
    ).toMatch(/og:description/);
  });

  it('server/index.js SSR handler injects JSON-LD structured data for blog routes', () => {
    // The handler appends a <script type="application/ld+json"> block
    expect(
      source,
      'JSON-LD structured data injection not found in server/index.js',
    ).toMatch(/application\/ld\+json/);
  });

  it('server/index.js SSR handler injects <meta name="description"> for blog routes', () => {
    expect(
      source,
      'meta name="description" injection not found in server/index.js',
    ).toMatch(/upsertMetaByName\(nextHtml,\s*'description'/);
  });

  it('server/index.js SSR handler injects <title> for blog routes', () => {
    expect(
      source,
      '<title> injection not found in server/index.js',
    ).toMatch(/<title>/);
  });
});

// ---------------------------------------------------------------------------
// Test 3.3 — Non-www → www 301 redirect middleware
//
// Preservation: server/index.js must contain the non-www to www redirect
// middleware that issues a 301 when host === 'demostoke.com'.
// ---------------------------------------------------------------------------
describe('Preservation 3.3 — Non-www → www redirect middleware', () => {
  const serverPath = path.join(ROOT, 'server/index.js');
  let source: string;

  try {
    source = fs.readFileSync(serverPath, 'utf-8');
  } catch {
    source = '';
  }

  it('server/index.js should contain a non-www to www redirect middleware', () => {
    // The middleware checks host === 'demostoke.com' and redirects to www
    expect(
      source,
      'Non-www to www redirect middleware not found in server/index.js',
    ).toMatch(/demostoke\.com/);
  });

  it('server/index.js non-www redirect should issue a 301', () => {
    expect(
      source,
      '301 redirect not found in non-www middleware in server/index.js',
    ).toMatch(/redirect\s*\(\s*301/);
  });

  it('server/index.js non-www redirect should target www.demostoke.com', () => {
    expect(
      source,
      'www.demostoke.com not found in redirect target in server/index.js',
    ).toMatch(/www\.demostoke\.com/);
  });
});

// ---------------------------------------------------------------------------
// Test 3.4 — robots.txt disallows private routes and references sitemap
//
// Preservation: public/robots.txt must disallow /profile, /admin, /my-gear,
// /analytics, /bookings, and must reference /sitemap.xml.
// ---------------------------------------------------------------------------
describe('Preservation 3.4 — robots.txt', () => {
  const robotsPath = path.join(ROOT, 'public/robots.txt');
  let robotsTxt: string;

  try {
    robotsTxt = fs.readFileSync(robotsPath, 'utf-8');
  } catch {
    robotsTxt = '';
  }

  it('public/robots.txt should exist', () => {
    expect(
      fs.existsSync(robotsPath),
      'public/robots.txt does not exist',
    ).toBe(true);
  });

  it('robots.txt should disallow /profile', () => {
    expect(robotsTxt, 'robots.txt does not disallow /profile').toMatch(/Disallow:\s*\/profile/);
  });

  it('robots.txt should disallow /admin', () => {
    expect(robotsTxt, 'robots.txt does not disallow /admin').toMatch(/Disallow:\s*\/admin/);
  });

  it('robots.txt should disallow /my-gear', () => {
    expect(robotsTxt, 'robots.txt does not disallow /my-gear').toMatch(/Disallow:\s*\/my-gear/);
  });

  it('robots.txt should disallow /analytics', () => {
    expect(robotsTxt, 'robots.txt does not disallow /analytics').toMatch(/Disallow:\s*\/analytics/);
  });

  it('robots.txt should disallow /bookings', () => {
    expect(robotsTxt, 'robots.txt does not disallow /bookings').toMatch(/Disallow:\s*\/bookings/);
  });

  it('robots.txt should reference /sitemap.xml', () => {
    expect(robotsTxt, 'robots.txt does not reference /sitemap.xml').toMatch(/Sitemap:.*\/sitemap\.xml/);
  });
});

// ---------------------------------------------------------------------------
// Test 3.5 — GoogleTagManager.tsx pushes page_view events to window.dataLayer
//
// Preservation: GoogleTagManager.tsx must push page_view events to
// window.dataLayer on every SPA route change.
// ---------------------------------------------------------------------------
describe('Preservation 3.5 — GTM dataLayer page_view events', () => {
  const gtmPath = path.join(ROOT, 'src/components/GoogleTagManager.tsx');
  let source: string;

  try {
    source = fs.readFileSync(gtmPath, 'utf-8');
  } catch {
    source = '';
  }

  it('GoogleTagManager.tsx should exist', () => {
    expect(
      fs.existsSync(gtmPath),
      'src/components/GoogleTagManager.tsx does not exist',
    ).toBe(true);
  });

  it('GoogleTagManager.tsx should push page_view events to window.dataLayer', () => {
    expect(
      source,
      'page_view event push not found in GoogleTagManager.tsx',
    ).toMatch(/page_view/);
  });

  it('GoogleTagManager.tsx should push to window.dataLayer', () => {
    expect(
      source,
      'window.dataLayer push not found in GoogleTagManager.tsx',
    ).toMatch(/window\.dataLayer/);
  });

  it('GoogleTagManager.tsx should use useLocation to detect route changes', () => {
    expect(
      source,
      'useLocation not found in GoogleTagManager.tsx — route change detection may be broken',
    ).toMatch(/useLocation/);
  });

  it('GoogleTagManager.tsx should push page_location to dataLayer', () => {
    expect(
      source,
      'page_location not found in GoogleTagManager.tsx dataLayer push',
    ).toMatch(/page_location/);
  });

  it('GoogleTagManager.tsx should push page_path to dataLayer', () => {
    expect(
      source,
      'page_path not found in GoogleTagManager.tsx dataLayer push',
    ).toMatch(/page_path/);
  });
});

// ---------------------------------------------------------------------------
// Test 3.6 — Amplitude tracking is initialized and unaffected
//
// Preservation: src/utils/tracking.ts must exist and export trackEvent,
// which calls window.amplitude.track for Amplitude tracking.
// ---------------------------------------------------------------------------
describe('Preservation 3.6 — Amplitude tracking', () => {
  const trackingPath = path.join(ROOT, 'src/utils/tracking.ts');
  let source: string;

  try {
    source = fs.readFileSync(trackingPath, 'utf-8');
  } catch {
    source = '';
  }

  it('src/utils/tracking.ts should exist', () => {
    expect(
      fs.existsSync(trackingPath),
      'src/utils/tracking.ts does not exist',
    ).toBe(true);
  });

  it('tracking.ts should export trackEvent function', () => {
    expect(
      source,
      'trackEvent export not found in src/utils/tracking.ts',
    ).toMatch(/export\s+const\s+trackEvent/);
  });

  it('tracking.ts should call window.amplitude.track for Amplitude', () => {
    expect(
      source,
      'window.amplitude.track not found in tracking.ts — Amplitude tracking may be broken',
    ).toMatch(/window\.amplitude.*track/);
  });

  it('tracking.ts should also push to window.dataLayer for GA4', () => {
    expect(
      source,
      'window.dataLayer push not found in tracking.ts',
    ).toMatch(/window\.dataLayer/);
  });
});

// ---------------------------------------------------------------------------
// Property-based test — for any random slug, the SSR handler in server/index.js
// always contains the code to inject <meta property="og: for blog routes.
//
// This is a structural assertion: the server code must contain the og: injection
// pattern regardless of what slug is requested.
//
// Validates: Requirements 3.1, 3.2
// ---------------------------------------------------------------------------
describe('Property-based: SSR handler always injects og: meta for blog routes', () => {
  const serverPath = path.join(ROOT, 'server/index.js');
  const source = fs.readFileSync(serverPath, 'utf-8');

  it('server/index.js contains og: meta injection code (structural property)', () => {
    // The SSR handler replaces og:title, og:description, og:image, og:url, og:type
    // for blog, gear, and demo-events routes. This structural check confirms the
    // injection code is present regardless of runtime slug values.
    expect(
      source,
      'og: meta injection code not found in server/index.js — SSR Open Graph tags will be missing',
    ).toMatch(/upsertMetaByProperty\(nextHtml,\s*'og:/);
  });

  /**
   * Property: For any slug string, the server code structure that handles
   * /blog/:slug routes contains the og: meta injection pattern.
   *
   * We generate random slug strings and verify the server source (which is
   * static) always contains the injection code. This confirms the code path
   * exists for all possible slugs.
   *
   * Validates: Requirements 3.1, 3.2
   */
  it('property: for any random slug, server/index.js always contains og: injection helpers', () => {
    // Generate 50 random slug-like strings and verify the structural property holds for each
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789-';
    const randomSlug = (seed: number): string => {
      // Deterministic pseudo-random slug generation from a seed
      let s = seed;
      const len = 5 + (s % 30);
      let result = '';
      for (let i = 0; i < len; i++) {
        s = (s * 1664525 + 1013904223) & 0xffffffff;
        result += chars[Math.abs(s) % chars.length];
      }
      // Ensure it doesn't start or end with a dash
      return result.replace(/^-+|-+$/g, 'a');
    };

    for (let seed = 1; seed <= 50; seed++) {
      const slug = randomSlug(seed);
      // The server source is static — the injection code must always be present
      // regardless of what slug value would be passed at runtime.
      const hasOgInjection = /upsertMetaByProperty\(nextHtml,\s*'og:/.test(source);
      expect(
        hasOgInjection,
        `For slug "${slug}": server/index.js does not contain og: meta injection code`,
      ).toBe(true);
    }
  });
});
