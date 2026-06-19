import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getCachedYouTubeVideos, setCachedYouTubeVideos } from "@/services/youtubeTutorialCacheService";

export interface YouTubeVideo {
  videoId: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
}

// A YouTube quota/rate-limit (HTTP 429) is a transient, retryable condition, not
// a hard failure. Detect it from the edge function error so the UI can show a
// "try again later" message instead of a generic error. Handles both the clean
// 429 response and a generic non-2xx body that still mentions a 429.
const isRateLimitError = async (fnError: unknown): Promise<boolean> => {
  const context = fnError && typeof fnError === "object" && "context" in fnError
    ? (fnError as { context?: unknown }).context
    : null;

  if (!context || typeof context !== "object") return false;

  if ((context as { status?: number }).status === 429) return true;

  const json = (context as { json?: unknown }).json;
  if (typeof json !== "function") return false;

  try {
    const body = await (json as () => Promise<unknown>).call(context) as
      | { error?: unknown; rateLimited?: unknown }
      | null;
    if (body?.rateLimited === true) return true;
    const message = typeof body?.error === "string" ? body.error : "";
    return message.includes("429") || /rate.?limit/i.test(message);
  } catch {
    return false;
  }
};

export function useYouTubeSearch() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);

  // Stable references: consumers depend on these in effect deps, so an unstable
  // identity here would re-fire the search every render and spin forever.
  const searchVideos = useCallback(async (query: string, maxResults = 3) => {
    setIsLoading(true);
    setError(null);
    setIsRateLimited(false);

    // Serve cached results to avoid spending YouTube API quota on repeat opens.
    const cached = getCachedYouTubeVideos(query);
    if (cached) {
      setVideos(cached);
      setIsLoading(false);
      return cached;
    }

    try {
      const { data, error: fnError } = await supabase.functions.invoke("youtube-tutorial-search", {
        body: { query, maxResults },
      });

      if (fnError) {
        if (await isRateLimitError(fnError)) {
          setIsRateLimited(true);
          setVideos([]);
          return [];
        }
        throw new Error(fnError.message);
      }

      if (data?.videos && data.videos.length > 0) {
        setVideos(data.videos);
        setCachedYouTubeVideos(query, data.videos);
        return data.videos;
      }

      setVideos([]);
      return [];
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to search videos";
      setError(message);
      console.error("useYouTubeSearch error:", err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setVideos([]);
    setError(null);
    setIsRateLimited(false);
  }, []);

  return {
    videos,
    isLoading,
    error,
    isRateLimited,
    searchVideos,
    reset,
  };
}
