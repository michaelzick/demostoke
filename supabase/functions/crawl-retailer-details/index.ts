// Supabase Edge Function: crawl-retailer-details (enhanced)
// Crawls retailer sites with Firecrawl, finds relevant gear pages, and extracts contact info and address

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CrawlPayload {
  urls: string[];
  keywords?: string[]; // e.g., ["snowboard","ski","surfboard","mountain bike"]
  limit?: number; // max pages to crawl per site
}

interface PageItem {
  url: string;
  title?: string;
  html?: string;
  markdown?: string;
}

function tryParseJSON<T = any>(str: string): T | null {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

function extractFromJsonLd(html: string) {
  const results: { address?: string; phone?: string; email?: string } = {};
  const scriptRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;
  while ((match = scriptRegex.exec(html))) {
    const json = tryParseJSON<any>(match[1]?.trim() || "");
    if (!json) continue;
    const items = Array.isArray(json) ? json : [json];
    for (const item of items) {
      const address = item?.address || item?.location?.address;
      if (address) {
        const parts = [
          address.streetAddress,
          address.addressLocality,
          address.addressRegion,
          address.postalCode,
          address.addressCountry,
        ].filter(Boolean);
        if (parts.length >= 3) results.address = parts.join(", ");
      }
      if (item?.telephone && !results.phone) results.phone = String(item.telephone);
      if (item?.email && !results.email) results.email = String(item.email);
    }
  }
  return results;
}

function extractContactInfo(text: string) {
  const emailMatch = text.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i);
  const phoneMatch = text.match(/(\+?\d{1,2}[\s.-]?)?(\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}/);
  return {
    email: emailMatch?.[0],
    phone: phoneMatch?.[0],
  };
}

// Very rough US address pattern as fallback
const ADDRESS_REGEX = /(\d{1,6}\s+[A-Za-z0-9\.\- ]+?\s(?:St|Street|Ave|Avenue|Blvd|Boulevard|Rd|Road|Dr|Drive|Ct|Court|Ln|Lane|Way|Pkwy|Parkway)\.?\,?\s+[A-Za-z\.\- ]+\,\s*[A-Z]{2}\s*\d{5}(?:-\d{4})?)/;

function extractAddress(text: string): string | undefined {
  const m = text.match(ADDRESS_REGEX);
  return m?.[0];
}

function mapKeywordToCategory(kw: string): string {
  switch (kw.toLowerCase()) {
    case "snowboard":
      return "snowboards";
    case "ski":
      return "skis";
    case "surfboard":
      return "surfboards";
    case "mountain bike":
      return "mountain-bikes";
    default:
      return kw;
  }
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
    const keywords = (payload?.keywords?.length ? payload.keywords : ["snowboard", "ski", "surfboard", "mountain bike"]).map(
      (k) => k.toLowerCase()
    );
    const limit = Math.min(Math.max(payload?.limit ?? 30, 5), 80);

    if (urls.length === 0) {
      return new Response(JSON.stringify({ error: "No urls provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    async function crawlSite(baseUrl: string): Promise<PageItem[]> {
      // Use Firecrawl crawl to get multiple pages
      try {
        const crawlRes = await fetch("https://api.firecrawl.dev/v1/crawl", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
          },
          body: JSON.stringify({
            url: baseUrl,
            limit,
            scrapeOptions: { formats: ["html", "markdown"] },
          }),
        });
        const crawlData = await crawlRes.json();
        const pagesRaw = crawlData?.data ?? crawlData?.results ?? crawlData?.pages ?? [];
        const pages: PageItem[] = [];
        for (const p of pagesRaw) {
          const url = p?.url || p?.source || p?.link || baseUrl;
          const html = p?.html ?? p?.data?.html ?? p?.content?.html ?? "";
          const markdown = p?.markdown ?? p?.data?.markdown ?? p?.content?.markdown ?? "";
          const title = p?.title ?? p?.metadata?.title ?? "";
          pages.push({ url, html, markdown, title });
        }
        if (pages.length > 0) return pages;
      } catch (e) {
        console.error("Firecrawl crawl failed", baseUrl, e);
      }

      // Fallback: single page scrape when crawl is unavailable
      try {
        const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
          },
          body: JSON.stringify({ url: baseUrl, formats: ["html", "markdown"] }),
        });
        const data = await res.json();
        const html = data?.html ?? data?.data?.html ?? "";
        const markdown = data?.markdown ?? data?.data?.markdown ?? "";
        return [{ url: baseUrl, html, markdown }];
      } catch (e) {
        console.error("Firecrawl scrape fallback failed", baseUrl, e);
        return [];
      }
    }

    const results: Array<{
      url: string;
      email?: string;
      phone?: string;
      address?: string;
      relevantPages?: Array<{ url: string; title?: string; categories?: string[] }>;
      matchedCategories?: string[];
      // kept for backward-compatibility with the previous UI, but minimized
      html?: string;
      markdown?: string;
      error?: string;
    }> = [];

    for (const url of urls) {
      try {
        const pages = await crawlSite(url);
        const textAll = pages.map((p) => `${p.markdown || ""}\n${p.html || ""}`).join("\n\n");
        // Extract contact info and address
        const fromJsonLd = pages.map((p) => p.html || "").reduce((acc, html) => {
          const ext = extractFromJsonLd(html);
          return {
            address: acc.address || ext.address,
            phone: acc.phone || ext.phone,
            email: acc.email || ext.email,
          };
        }, { address: undefined as string | undefined, phone: undefined as string | undefined, email: undefined as string | undefined });

        const contactFallback = extractContactInfo(textAll);
        const addressFallback = extractAddress(textAll);

        // Identify relevant pages per keyword category
        const relevantPages: Array<{ url: string; title?: string; categories?: string[] }> = [];
        const matchedCategoriesSet = new Set<string>();
        const contactLike = ["contact", "location", "visit", "find-us", "findus", "about", "store", "shop"];

        for (const p of pages) {
          const hay = `${p.title || ""}\n${p.markdown || ""}`.toLowerCase();
          const found: string[] = [];
          for (const k of keywords) {
            if (hay.includes(k)) {
              found.push(mapKeywordToCategory(k));
              matchedCategoriesSet.add(mapKeywordToCategory(k));
            }
          }
          if (found.length > 0) {
            relevantPages.push({ url: p.url, title: p.title, categories: Array.from(new Set(found)) });
          } else if (contactLike.some((c) => p.url.toLowerCase().includes(c))) {
            // Prefer to keep contact/location page too
            relevantPages.push({ url: p.url, title: p.title, categories: [] });
          }
        }

        results.push({
          url,
          email: fromJsonLd.email || contactFallback.email,
          phone: fromJsonLd.phone || contactFallback.phone,
          address: fromJsonLd.address || addressFallback,
          relevantPages,
          matchedCategories: Array.from(matchedCategoriesSet),
          // keep minimal homepage content for backward-compatibility
          html: pages[0]?.html || "",
          markdown: pages[0]?.markdown || "",
        });
      } catch (e) {
        console.error("Failed to process", url, e);
        results.push({ url, error: e instanceof Error ? e.message : "Unknown error" });
      }
    }

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
