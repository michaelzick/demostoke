import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(__dirname, '../../');

describe('Google Search Console verification', () => {
  it('public/ should not require a google*.html verification file in this repo', () => {
    const publicDir = path.join(ROOT, 'public');
    const files = fs.readdirSync(publicDir);
    const verificationFiles = files.filter(
      (f) => f.startsWith('google') && f.endsWith('.html'),
    );
    expect(verificationFiles.length).toBe(0);
  });
});

describe('Core Web Vitals reporting', () => {
  it('package.json should list web-vitals in dependencies', () => {
    const pkgPath = path.join(ROOT, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    expect(
      'web-vitals' in allDeps,
      'web-vitals is not listed in package.json dependencies — CWV metrics will never be collected',
    ).toBe(true);
  });

  it('src/app/providers.tsx should import and call reportWebVitals()', () => {
    const mainPath = path.join(ROOT, 'src/app/providers.tsx');
    const source = fs.readFileSync(mainPath, 'utf-8');
    const importsReportWebVitals = /import.*reportWebVitals/.test(source);
    const callsReportWebVitals = /reportWebVitals\s*\(/.test(source);
    expect(
      importsReportWebVitals && callsReportWebVitals,
      'reportWebVitals() is not imported or called in src/app/providers.tsx — CWV metrics will never be reported',
    ).toBe(true);
  });
});
