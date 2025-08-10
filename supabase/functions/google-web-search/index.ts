// Supabase Edge Function: google-web-search
// Searches the web using Google Custom Search for businesses with specified gear keywords near a location

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SearchPayload {
  zip?: string;
  lat?: number;
  lng?: number;
  radiusMiles?: number;
  keywords: string[];
  maxResults?: number;
}

interface SearchItem {
  title: string;
  link: string;
  snippet?: string;
  displayLink?: string;
}

const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");
const GOOGLE_CSE_ID = Deno.env.get("GOOGLE_CSE_ID");

async function googleSearch(q: string, start = 1): Promise<SearchItem[]> {
  if (!GOOGLE_API_KEY || !GOOGLE_CSE_ID) {
    console.error("Missing GOOGLE_API_KEY or GOOGLE_CSE_ID env.");
    return [];
  }
  const url = new URL("https://www.googleapis.com/customsearch/v1");
  url.searchParams.set("key", GOOGLE_API_KEY);
  url.searchParams.set("cx", GOOGLE_CSE_ID);
  url.searchParams.set("q", q);
  url.searchParams.set("num", "10");
  url.searchParams.set("start", String(start));

  const res = await fetch(url.toString());
  if (!res.ok) {
    console.error("Google CSE error", await res.text());
    return [];
  }
  const data = await res.json();
  return (data.items || []).map((it: any) => ({
    title: it.title,
    link: it.link,
    snippet: it.snippet,
    displayLink: it.displayLink,
  }));
}

function buildQueries(payload: SearchPayload): string[] {
  const locationPart = payload.zip ? `near ${payload.zip}` : "";
  const radiusPart = payload.radiusMiles ? `${payload.radiusMiles} miles` : "";
  const baseSuffix = [locationPart, radiusPart].filter(Boolean).join(" ");

  const patterns = [
    "shop",
    "rental",
    "store",
  ];

  const queries: string[] = [];
  for (const kw of payload.keywords) {
    for (const p of patterns) {
      const q = `${kw} ${p} ${baseSuffix}`.trim();
      queries.push(q);
    }
  }
  return queries;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = (await req.json()) as SearchPayload;
    const queries = buildQueries(payload);
    const max = Math.min(payload.maxResults || 30, 40);

    const results: SearchItem[] = [];
    // Run searches sequentially per query but limit total
    for (const q of queries) {
      if (results.length >= max) break;
      const items = await googleSearch(q);
      for (const it of items) {
        if (results.length >= max) break;
        results.push(it);
      }
    }

    // Deduplicate by domain
    const seen = new Set<string>();
    const deduped: SearchItem[] = [];
    for (const r of results) {
      try {
        const d = new URL(r.link).hostname.replace(/^www\./, "");
        if (!seen.has(d)) {
          seen.add(d);
          deduped.push(r);
        }
      } catch {}
    }

    return new Response(JSON.stringify({ results: deduped }), {
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
