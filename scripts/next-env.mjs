import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from '../src/integrations/supabase/config.js';

export function loadNextEnvironment() {
  try {
    process.loadEnvFile('.env.next');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  return {
    target: process.env.DEMOSTOKE_DEPLOYMENT_TARGET
      || (process.env.WORKERS_CI && process.env.WORKERS_CI_BRANCH === 'main' ? 'production' : 'preview'),
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
      || process.env.VITE_SUPABASE_URL || SUPABASE_URL,
    publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
      || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
      || SUPABASE_PUBLISHABLE_KEY,
  };
}
