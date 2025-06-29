
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchRequest {
  query: string;
  gearType?: string;
  count?: number;
}

interface SearchResult {
  url: string;
  thumbnail: string;
  title: string;
  source: string;
  width?: number;
  height?: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, gearType, count = 10 }: SearchRequest = await req.json();
    
    const apiKey = Deno.env.get('GOOGLE_SEARCH_API_KEY');
    const searchEngineId = Deno.env.get('GOOGLE_SEARCH_ENGINE_ID');
    
    if (!apiKey || !searchEngineId) {
      throw new Error('Google Search API configuration missing');
    }

    // Build smart search query
    let searchQuery = query;
    if (gearType) {
      searchQuery = `${query} ${gearType} product`;
    }

    const searchUrl = new URL('https://www.googleapis.com/customsearch/v1');
    searchUrl.searchParams.set('key', apiKey);
    searchUrl.searchParams.set('cx', searchEngineId);
    searchUrl.searchParams.set('q', searchQuery);
    searchUrl.searchParams.set('searchType', 'image');
    searchUrl.searchParams.set('num', Math.min(count, 10).toString());
    searchUrl.searchParams.set('imgSize', 'large');
    searchUrl.searchParams.set('imgType', 'photo');
    searchUrl.searchParams.set('safe', 'active');

    console.log('Searching for:', searchQuery);

    const response = await fetch(searchUrl.toString());
    
    if (!response.ok) {
      throw new Error(`Google Search API error: ${response.status}`);
    }

    const data = await response.json();
    
    const results: SearchResult[] = (data.items || []).map((item: any) => ({
      url: item.link,
      thumbnail: item.image?.thumbnailLink || item.link,
      title: item.title,
      source: item.displayLink || 'Unknown',
      width: item.image?.width,
      height: item.image?.height,
    }));

    console.log(`Found ${results.length} images for query: ${searchQuery}`);

    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('Error in google-image-search function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
