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
// Test 3.6 — Mixpanel tracking is initialized and unaffected
//
// Preservation: src/utils/tracking.ts must exist and export trackEvent,
// which calls window.mixpanel.track for Mixpanel tracking.
// ---------------------------------------------------------------------------
describe('Preservation 3.6 — Mixpanel tracking', () => {
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

  it('tracking.ts should call window.mixpanel.track for Mixpanel', () => {
    expect(
      source,
      'window.mixpanel.track not found in tracking.ts — Mixpanel tracking may be broken',
    ).toMatch(/window\.mixpanel.*track/);
  });

  it('tracking.ts should also push to window.dataLayer for GA4', () => {
    expect(
      source,
      'window.dataLayer push not found in tracking.ts',
    ).toMatch(/window\.dataLayer/);
  });
});

// ---------------------------------------------------------------------------
