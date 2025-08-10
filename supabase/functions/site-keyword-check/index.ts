// Supabase Edge Function: site-keyword-check
// Fetches homepages and checks for presence of gear-related keywords

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CheckPayload {
  urls: string[];
  keywords: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = (await req.json()) as CheckPayload;
    const results = await Promise.all(
      payload.urls.map(async (u) => {
        try {
          const res = await fetch(u, { headers: { "user-agent": "Mozilla/5.0" } });
          const text = await res.text();
          const lower = text.toLowerCase();
          const matched = payload.keywords.filter((k) => lower.includes(k.toLowerCase()));
          return { url: u, matchedKeywords: Array.from(new Set(matched)) };
        } catch (e) {
          console.error("Fetch failed for", u, e);
          return { url: u, matchedKeywords: [] as string[] };
        }
      })
    );

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: "Bad request" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
