import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from './config.js';
import { isReadOnlyPreview } from '@/lib/deployment';

const hasBrowserSession = typeof window !== 'undefined' && !isReadOnlyPreview;
const previewReads = new Set([
  '/functions/v1/get-mapbox-token',
  '/functions/v1/get-user-display-role',
  '/rest/v1/rpc/get_public_generated_gear_review_metadata',
]);

const previewFetch: typeof fetch = (input, init) => {
  const method = (init?.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase();
  const path = new URL(input instanceof Request ? input.url : input).pathname;
  if (path.startsWith('/auth/') || (!['GET', 'HEAD'].includes(method) && !previewReads.has(path))) {
    return Promise.resolve(new Response(JSON.stringify({ message: 'This preview is read-only.' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    }));
  }
  return fetch(input, init);
};

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: hasBrowserSession,
      autoRefreshToken: hasBrowserSession,
      detectSessionInUrl: hasBrowserSession,
    },
    ...(isReadOnlyPreview ? { global: { fetch: previewFetch } } : {}),
  },
);
