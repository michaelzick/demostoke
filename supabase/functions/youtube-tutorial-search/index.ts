import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface YouTubeSearchRequest {
  query: string;
  maxResults?: number;
}

interface YouTubeVideo {
  videoId: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, maxResults = 3 } = await req.json() as YouTubeSearchRequest;
    
    const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");
    if (!GOOGLE_API_KEY) {
      throw new Error("GOOGLE_API_KEY is not configured");
    }

    console.log(`Searching YouTube for: ${query}`);

    // YouTube Data API v3 search endpoint
    const searchParams = new URLSearchParams({
      part: "snippet",
      q: query,
      type: "video",
      maxResults: maxResults.toString(),
      videoDuration: "medium", // 4-20 minutes - good for tutorials
      videoEmbeddable: "true",
      safeSearch: "strict",
      relevanceLanguage: "en",
      key: GOOGLE_API_KEY,
    });

    const youtubeUrl = `https://www.googleapis.com/youtube/v3/search?${searchParams}`;
    
    const response = await fetch(youtubeUrl);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("YouTube API error:", response.status, errorText);
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      console.log("No videos found for query");
      return new Response(JSON.stringify({ videos: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const videos: YouTubeVideo[] = data.items.map((item: any) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
    }));

    console.log(`Found ${videos.length} videos`);

    return new Response(JSON.stringify({ videos }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("youtube-tutorial-search error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
