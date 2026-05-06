# DemoStoke

DemoStoke is a Vite, React, and TypeScript marketplace for action-sports gear demos, rentals, listings, profiles, and related content.

## Local Development

Use Node 24 or newer.

```sh
npm install
npm run dev
```

The Vite dev server runs on port `8080` by default.

For SSR development:

```sh
npm run dev:ssr
```

The Express SSR server uses `PORT` when set and otherwise defaults to `8080`.

## Useful Commands

```sh
npm run lint
npm run type-check
npm run build
npm run test:unit
npm run generate-sitemap
```

## Environment

Create a local `.env` file when overriding checked-in public Supabase defaults or running SSR metadata enrichment locally.

```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_PUBLISHABLE_KEY=your-local-publishable-key
```

Supabase edge functions use their own secrets, including `OPENAI_API_KEY`, service-role Supabase credentials, and provider keys for Mapbox, Google Search, and hCaptcha where needed.
