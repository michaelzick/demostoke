
import { supabase } from "@/integrations/supabase/client";

// Module-level cache — survives across renders and avoids thousands of re-queries
// on this 2-row table (which always seq-scans).
let _settingsCache: Record<string, unknown> = {};
let _cacheExpiresAt = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

async function getAllAppSettings(): Promise<Record<string, unknown>> {
  if (Date.now() < _cacheExpiresAt) return _settingsCache;

  const { data } = await supabase
    .from('app_settings')
    .select('setting_key, setting_value');

  _settingsCache = Object.fromEntries(
    (data ?? []).map((r) => [r.setting_key, r.setting_value]),
  );
  _cacheExpiresAt = Date.now() + CACHE_TTL_MS;
  return _settingsCache;
}

// Get global app setting for AI search usage
export const getUseAISearchSetting = async (): Promise<boolean> => {
  try {
    const settings = await getAllAppSettings();
    return settings['use_ai_search'] === true;
  } catch (error) {
    console.error('❌ Exception fetching app setting:', error);
    return true;
  }
};
