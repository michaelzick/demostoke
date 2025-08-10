// Supabase Edge Function: crawl-retailer-details
// Uses Firecrawl to scrape retailer pages and return HTML/Markdown for simple contact extraction

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CrawlPayload {
  urls: string[];
  formats?: ("html" | "markdown")[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (!FIRECRAWL_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing FIRECRAWL_API_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = (await req.json()) as CrawlPayload;
    const urls = Array.isArray(payload?.urls) ? payload.urls : [];
    const formats = payload?.formats?.length ? payload.formats : ["html", "markdown"];

    if (urls.length === 0) {
      return new Response(JSON.stringify({ error: "No urls provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Simple concurrency limiter
    const concurrency = 3;
    const results: Array<{ url: string; html?: string; markdown?: string; error?: string }> = [];

    async function scrape(url: string) {
      try {
        const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
          },
          body: JSON.stringify({ url, formats }),
        });
        const data = await res.json();
        // Firecrawl can return various shapes; normalize
        const html = data?.html ?? data?.data?.html ?? "";
        const markdown = data?.markdown ?? data?.data?.markdown ?? "";
        results.push({ url, html, markdown });
      } catch (e) {
        console.error("Firecrawl scrape failed for", url, e);
        results.push({ url, error: e instanceof Error ? e.message : "Unknown error" });
      }
    }

    const queue = urls.slice();
    const workers: Promise<void>[] = [];
    for (let i = 0; i < Math.min(concurrency, queue.length); i++) {
      workers.push(
        (async () => {
          while (queue.length) {
            const next = queue.shift();
            if (!next) break;
            await scrape(next);
          }
        })()
      );
    }
    await Promise.all(workers);

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
