import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface YouTubeVideo {
  videoId: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
}

export function useYouTubeSearch() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchVideos = async (query: string, maxResults = 3) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("youtube-tutorial-search", {
        body: { query, maxResults },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data?.videos) {
        setVideos(data.videos);
        return data.videos;
      } else {
        setVideos([]);
        return [];
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to search videos";
      setError(message);
      console.error("useYouTubeSearch error:", err);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setVideos([]);
    setError(null);
  };

  return {
    videos,
    isLoading,
    error,
    searchVideos,
    reset,
  };
}
