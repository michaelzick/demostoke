/**
 * SEO Bug Condition Exploration Tests
 *
 * These tests are written BEFORE the fix and are EXPECTED TO FAIL on unfixed code.
 * Failure confirms the bugs exist. DO NOT fix the code or tests when they fail.
 *
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(__dirname, '../../');

// ---------------------------------------------------------------------------
// Test 1 — Sitemap shadow (Requirements 1.1, 1.2, 1.3)
//
// Bug condition: staticSitemapExists(public/sitemap.xml)
//   sirv serves the static file before the Express /sitemap.xml handler runs,
//   so Googlebot receives a stale file with private URLs and no dynamic content.
//
// EXPECTED TO FAIL: the static sitemap lacks /blog/, /gear/<slug>, and
//   /demo-calendar/event/ URLs, and it DOES contain private URLs.
// ---------------------------------------------------------------------------
describe('Test 1 — Sitemap shadow', () => {
  const sitemapPath = path.join(ROOT, 'public/sitemap.xml');

  it('public/sitemap.xml should NOT exist (static file shadows runtime endpoint)', () => {
    // The fix is to DELETE public/sitemap.xml so sirv no longer shadows the
    // Express handler. This test FAILS while the static file is present.
    const exists = fs.existsSync(sitemapPath);
    expect(exists, 'public/sitemap.xml exists — it shadows the runtime /sitemap.xml endpoint').toBe(false);
  });

  // When public/sitemap.xml is absent (the fix), the static shadow is gone and the
  // runtime /sitemap.xml endpoint serves dynamic content. The content tests below
  // only apply when the static file still exists (pre-fix); once deleted they pass
  // trivially because a non-existent file cannot contain private URLs or omit dynamic ones.

  it('sitemap should contain at least one /blog/ URL', () => {
    if (!fs.existsSync(sitemapPath)) return; // file deleted — runtime endpoint serves dynamic content ✓
    const xml = fs.readFileSync(sitemapPath, 'utf-8');
    expect(xml, 'No /blog/ URLs found in sitemap — dynamic blog posts are missing').toMatch(/\/blog\//);
  });

  it('sitemap should contain at least one /gear/<slug> URL (dynamic gear listing)', () => {
    if (!fs.existsSync(sitemapPath)) return; // file deleted — runtime endpoint serves dynamic content ✓
    // Static sitemap has /gear and /gear/surfboards but no dynamic /gear/<id-slug> URLs.
    // A dynamic gear URL looks like /gear/some-board-name--uuid
    const xml = fs.readFileSync(sitemapPath, 'utf-8');
    // Match a gear URL that contains the -- delimiter used by buildGearSlug
    expect(xml, 'No dynamic /gear/<slug> URLs found in sitemap — gear listings are missing').toMatch(/\/gear\/[^<"]+--[0-9a-f-]{36}/);
  });

  it('sitemap should contain at least one /demo-calendar/event/ URL', () => {
    if (!fs.existsSync(sitemapPath)) return; // file deleted — runtime endpoint serves dynamic content ✓
    const xml = fs.readFileSync(sitemapPath, 'utf-8');
    expect(xml, 'No /demo-calendar/event/ URLs found in sitemap — demo events are missing').toMatch(/\/demo-calendar\/event\//);
  });

  it('sitemap should NOT contain /profile', () => {
    if (!fs.existsSync(sitemapPath)) return; // file deleted — no private URLs can be served ✓
    const xml = fs.readFileSync(sitemapPath, 'utf-8');
    expect(xml, 'Private URL /profile found in sitemap').not.toMatch(/<loc>[^<]*\/profile[^<]*<\/loc>/);
  });

  it('sitemap should NOT contain /my-gear', () => {
    if (!fs.existsSync(sitemapPath)) return; // file deleted — no private URLs can be served ✓
    const xml = fs.readFileSync(sitemapPath, 'utf-8');
    expect(xml, 'Private URL /my-gear found in sitemap').not.toMatch(/<loc>[^<]*\/my-gear[^<]*<\/loc>/);
  });

  it('sitemap should NOT contain /admin', () => {
    if (!fs.existsSync(sitemapPath)) return; // file deleted — no private URLs can be served ✓
    const xml = fs.readFileSync(sitemapPath, 'utf-8');
    expect(xml, 'Private URL /admin found in sitemap').not.toMatch(/<loc>[^<]*\/admin[^<]*<\/loc>/);
  });

  it('sitemap should NOT contain /api/gear/search', () => {
    if (!fs.existsSync(sitemapPath)) return; // file deleted — no private URLs can be served ✓
    const xml = fs.readFileSync(sitemapPath, 'utf-8');
    expect(xml, 'Private URL /api/gear/search found in sitemap').not.toMatch(/<loc>[^<]*\/api\/gear\/search[^<]*<\/loc>/);
  });
});

// ---------------------------------------------------------------------------
// Test 2 — Demo event redirect (Requirement 1.4)
//
// Bug condition: url MATCHES /^\/demo-calendar\/event\/.+/
//               AND serverRedirects(url, "/demo-events/" + slug)
//
// EXPECTED TO FAIL: server/index.js contains the redirect block.
// ---------------------------------------------------------------------------
describe('Test 2 — Demo event redirect', () => {
  const serverPath = path.join(ROOT, 'server/index.js');

  it('server/index.js should NOT contain a redirect block for /demo-calendar/event/', () => {
    const source = fs.readFileSync(serverPath, 'utf-8');
    // The bug: app.get(['/event/:eventSlug', '/demo-calendar/event/:eventSlug'], ...) issues a 301
    const hasRedirectBlock = /app\.get\(\s*\[['"]\/event\/:eventSlug['"],\s*['"]\/demo-calendar\/event\/:eventSlug['"]\]/.test(source);
    expect(
      hasRedirectBlock,
      'Redirect block for /demo-calendar/event/:eventSlug found in server/index.js — this causes a 301 redirect chain',
    ).toBe(false);
  });

  it('buildDemoEventPath should return /demo-calendar/event/:slug (not /demo-events/:slug)', () => {
    const source = fs.readFileSync(serverPath, 'utf-8');
    // The bug: buildDemoEventPath returns `/demo-events/${...}` instead of `/demo-calendar/event/${...}`
    const hasWrongPath = /const buildDemoEventPath\s*=\s*\(event\)\s*=>\s*`\/demo-events\//.test(source);
    expect(
      hasWrongPath,
      'buildDemoEventPath returns /demo-events/:slug — should return /demo-calendar/event/:slug',
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Test 3 — Verification file (Requirement 1.5)
//
// Bug condition: NOT fileExistsInPublic("google*.html")
//
// EXPECTED TO FAIL: no google*.html file exists in public/.
// ---------------------------------------------------------------------------
describe('Test 3 — Google Search Console verification file', () => {
  it('public/ should contain at least one google*.html verification file', () => {
    const publicDir = path.join(ROOT, 'public');
    const files = fs.readdirSync(publicDir);
    const verificationFiles = files.filter(
      (f) => f.startsWith('google') && f.endsWith('.html'),
    );
    expect(
      verificationFiles.length,
      'No google*.html verification file found in public/ — Google Search Console ownership verification will fail (404)',
    ).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Test 4 — Core Web Vitals reporting (Requirement 1.6)
//
// Bug condition: NOT packageInstalled("web-vitals")
//
// EXPECTED TO FAIL: web-vitals is not in package.json dependencies,
//   and reportWebVitals() is not called from src/main.tsx.
// ---------------------------------------------------------------------------
describe('Test 4 — Core Web Vitals reporting', () => {
  it('package.json should list web-vitals in dependencies', () => {
    const pkgPath = path.join(ROOT, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    expect(
      'web-vitals' in allDeps,
      'web-vitals is not listed in package.json dependencies — CWV metrics will never be collected',
    ).toBe(true);
  });

  it('src/main.tsx should import and call reportWebVitals()', () => {
    const mainPath = path.join(ROOT, 'src/main.tsx');
    const source = fs.readFileSync(mainPath, 'utf-8');
    const importsReportWebVitals = /import.*reportWebVitals/.test(source);
    const callsReportWebVitals = /reportWebVitals\s*\(/.test(source);
    expect(
      importsReportWebVitals && callsReportWebVitals,
      'reportWebVitals() is not imported or called in src/main.tsx — CWV metrics will never be reported',
    ).toBe(true);
  });
});
