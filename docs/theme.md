Theme pre-hydration, flicker fix, and developer guide

This document explains the pre-hydration theme resolution implemented in this repo. It covers the inline IIFE that sets the initial `<html>` classes before React hydrates, the ThemeProvider behavior, how to opt out, CSP considerations, and suggested tests.

Why this exists

Single-page apps often suffer a "theme flicker" where the app renders briefly in the wrong theme (usually light) before the client-side JavaScript applies the user's preferred theme. To avoid that we set the theme class on `<html>` early (before React hydrates) so the first paint matches the user's preference.

What the IIFE does

- Runs synchronously from `index.html` head before the app bundle is executed.
- Tries to read `ui-theme` from `localStorage`.
- If `localStorage` throws (some browsers / privacy modes), falls back to reading a `ui-theme` cookie that the ThemeProvider writes.
- If `ui-theme` is `system`, the IIFE uses `matchMedia('(prefers-color-scheme: dark)')` to resolve to `dark` or `light`.
- Adds one of these class names to `<html>`: `light` or `dark`. It may also add a `system` marker class when the stored preference is `system`.
- Applies a short-lived `theme-resolving` class while it determines the theme to temporarily suppress transitions/animations.

ThemeProvider behavior

- Reads initial `ui-theme` from `localStorage` (or cookie fallback) and keeps React state in sync.
- Persists changes to `localStorage` and writes a `ui-theme` cookie to support the IIFE in environments where `localStorage` is blocked.
- When the theme is `system`, it subscribes to `matchMedia('(prefers-color-scheme: dark)')` to reflect live OS changes.
- Ensures `<html>` classes are consistent with provider state.

How to opt-out / toggle the fix

Two mechanisms are available to disable the pre-hydration fix for testing or environments where the inline script is unacceptable:

1) Meta tag in `index.html` (recommended for per-page control)

    <meta name="enable-theme-flicker-fix" content="false">

2) Build-time env flag (set at build time)

- The build converts a Vite env variable into `window.__ENABLE_THEME_FLICKER_FIX` in a small module script in `index.html`. Set that env var to `false` to disable the IIFE at runtime.

CSP guidance

Because the IIFE is an inline script in `index.html`, a strict Content Security Policy (CSP) that disallows `unsafe-inline` scripts will block it. There are two safe ways to allow it:

1) Use a script nonce

- Generate a per-page nonce on the server and inject it into a `Content-Security-Policy` header and into the inline script tag:

    <script nonce="<PAGE_NONCE>">/* IIFE */</script>

- The IIFE will then run only when the page-specific nonce matches the policy.

2) Use a script hash

- Compute the SHA-256 (or other supported hash) of the exact inline script content and include the hash in the CSP header. This is brittle if you edit the script but avoids allowing all inline scripts.

Notes about nonces and hashes:

- Use nonces when you can inject a new header per request (server-side rendering or dynamic HTML). If you're serving a static site, use a hash and lock the inline script content.
- If you prefer to avoid inline scripts entirely, move the resolver to a separate static JS file and include it via a `<script src=...>` tag; update your CSP to allow that source.

Developer/testing notes

- The ThemeProvider also writes a `ui-theme` cookie. If you want to simulate a blocked `localStorage` environment, clear `localStorage` and set the `ui-theme` cookie manually in dev tools and reload; the IIFE should read the cookie and set the correct theme.
- To test the `system` mode, set the provider to `system` and toggle your OS dark/light mode. The provider listens to `prefers-color-scheme` and updates at runtime.

Recommended tests

- Unit: A small unit test for the resolver logic (if you extract it) to assert cookie fallback and matchMedia resolution.
- E2E: A Playwright test that opens the page and asserts `<html>` has the expected `dark` or `light` class on first load.

Files touched

- `index.html` — inline IIFE and `theme-resolving` guard
- `src/contexts/*` — ThemeProvider, useTheme hook, context split
- `src/theme/storage.ts` — safe localStorage/cookie helpers

Contact

If you want me to:
- Move the inline IIFE to an external static file and update CSP guidance,
- Add the unit / Playwright tests described above,
- Or change the cookie name / expire semantics,

tell me which and I'll implement it.
