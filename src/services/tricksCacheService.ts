import { Trick } from "@/hooks/useTricksGeneration";

const STORAGE_KEY_PREFIX = "tricks_cache_";

interface CachedTricks {
  tricks: Trick[];
  cachedAt: string;
}

export function getCachedTricks(equipmentId: string): Trick[] | null {
  try {
    const key = `${STORAGE_KEY_PREFIX}${equipmentId}`;
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    
    const parsed: CachedTricks = JSON.parse(cached);
    return parsed.tricks;
  } catch {
    return null;
  }
}

export function setCachedTricks(equipmentId: string, tricks: Trick[]): void {
  try {
    const key = `${STORAGE_KEY_PREFIX}${equipmentId}`;
    const cacheData: CachedTricks = {
      tricks,
      cachedAt: new Date().toISOString(),
    };
    localStorage.setItem(key, JSON.stringify(cacheData));
  } catch (error) {
    console.error("Failed to cache tricks:", error);
  }
}

export function clearCachedTricks(equipmentId: string): void {
  try {
    const key = `${STORAGE_KEY_PREFIX}${equipmentId}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Failed to clear cached tricks:", error);
  }
}
