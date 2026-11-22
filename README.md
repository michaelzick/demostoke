# DemoStoke

DemoStoke is a Next.js App Router marketplace for action-sports gear demos, rentals, listings, profiles, and events. Cloudflare Workers hosts the app through OpenNext. Supabase handles data, auth, and Edge Functions.

## Local development

Use Node 24.

```sh
npm ci
cp .env.next.example .env.next
npm run dev
```

Next.js serves the app at `http://localhost:8080`. For read-only browsing with public production data, set `DEMOSTOKE_DEPLOYMENT_TARGET=preview` and use DemoStoke's public Supabase URL and publishable key. For sign-in and edits, set the target to `local` and use a local Supabase project. Shell and CI values take precedence over the ignored `.env.next` file. Only variables marked `NEXT_PUBLIC_` are compiled into the browser bundle.

## Checks

```sh
npm run lint
npm run type-check
npm run test:unit
npm run build:cloudflare
npm run preview:cloudflare
```

See [Cloudflare hosting](docs/cloudflare-hosting.md) for the branch preview, production cutover, and rollback commands. Supabase Edge Functions keep their credentials in Supabase.
