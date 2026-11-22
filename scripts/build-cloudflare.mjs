import { loadNextEnvironment } from './next-env.mjs';
import { execFileSync } from 'node:child_process';
import { rmSync } from 'node:fs';

const { target, supabaseUrl: url, publishableKey: key } = loadNextEnvironment();
const endpoint = URL.parse(url);
const loopback = endpoint && ['localhost', '127.0.0.1', '[::1]'].includes(endpoint.hostname);

let legacyRole;
try {
  const payload = key.split('.')[1];
  if (payload) legacyRole = JSON.parse(Buffer.from(payload, 'base64url').toString()).role;
} catch {
  // Legacy anon keys must include a readable anon role claim.
}

if (!endpoint || (endpoint.protocol !== 'https:' && !(target === 'local' && loopback))) {
  throw new Error('Set NEXT_PUBLIC_SUPABASE_URL to HTTPS, or to a loopback URL for local fixtures.');
}
if (!key.startsWith('sb_publishable_') && legacyRole !== 'anon') {
  throw new Error('Set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to a Supabase publishable or legacy anon key.');
}
if (!['local', 'preview', 'production'].includes(target)) {
  throw new Error('Set DEMOSTOKE_DEPLOYMENT_TARGET to local, preview, or production.');
}

try {
  execFileSync('opennextjs-cloudflare', ['build', '--config', 'wrangler.jsonc'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      DEMOSTOKE_DEPLOYMENT_TARGET: target,
      NEXT_PUBLIC_SUPABASE_URL: url,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: key,
    },
  });
} finally {
  // Next standalone and OpenNext can copy the root tooling env into their output.
  // Workers gets private runtime settings from bindings.
  for (const directory of ['.next/standalone', '.open-next/server-functions/default']) {
    for (const file of ['.env', '.env.production']) {
      rmSync(`${directory}/${file}`, { force: true });
    }
  }
}
