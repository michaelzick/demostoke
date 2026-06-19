import type { YouTubeVideo } from "@/hooks/useYouTubeSearch";

// YouTube Data API search costs 100 quota units per call against a shared
// ~10k/day pool, so we cache results per search query to avoid re-spending
// quota every time a trick drawer is opened.
const STORAGE_KEY_PREFIX = "youtube_tutorial_cache_";
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface CachedYouTubeVideos {
  videos: YouTubeVideo[];
  cachedAt: string;
}

const keyFor = (query: string) => `${STORAGE_KEY_PREFIX}${query.trim().toLowerCase()}`;

export function getCachedYouTubeVideos(query: string): YouTubeVideo[] | null {
  try {
    const cached = localStorage.getItem(keyFor(query));
    if (!cached) return null;

    const parsed: CachedYouTubeVideos = JSON.parse(cached);
    if (!parsed.videos?.length) return null;

    const age = Date.now() - new Date(parsed.cachedAt).getTime();
    if (Number.isNaN(age) || age > CACHE_TTL_MS) {
      localStorage.removeItem(keyFor(query));
      return null;
    }

    return parsed.videos;
  } catch {
    return null;
  }
}

export function setCachedYouTubeVideos(query: string, videos: YouTubeVideo[]): void {
  // Never cache empty results: an empty list usually means a transient miss or
  // rate limit, and caching it would suppress a later successful search.
  if (!videos.length) return;

  try {
    const cacheData: CachedYouTubeVideos = {
      videos,
      cachedAt: new Date().toISOString(),
    };
    localStorage.setItem(keyFor(query), JSON.stringify(cacheData));
  } catch (error) {
    console.error("Failed to cache YouTube tutorials:", error);
  }
}
