// Supabase Edge Function: rental-discovery-agent
// Orchestrates 4 agents to discover, scrape, parse, and store ski/snowboard rental shops

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");
const GOOGLE_CSE_ID = Deno.env.get("GOOGLE_CSE_ID");
const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const MAPBOX_TOKEN = Deno.env.get("MAPBOX_TOKEN");

interface DiscoveryPayload {
  region?: string;
  categories?: string[];
  maxShops?: number;
}

// Helper: Escape SQL strings
function escapeSql(str: string): string {
  return str.replace(/'/g, "''");
}

// Helper: Geocode address using Mapbox
async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  if (!MAPBOX_TOKEN) return null;
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_TOKEN}&limit=1`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center;
      return { lat, lng };
    }
  } catch (e) {
    console.error("Geocoding error:", e);
  }
  return null;
}

// AGENT 1: Search Agent - Find rental shops
async function searchAgent(keywords: string[], location: string, radiusMiles: number, maxResults: number) {
  console.log("🔍 AGENT 1: Search Agent starting...");
  
  if (!GOOGLE_API_KEY || !GOOGLE_CSE_ID) {
    throw new Error("Missing GOOGLE_API_KEY or GOOGLE_CSE_ID");
  }

  const results: any[] = [];
  for (const kw of keywords) {
    const query = `${kw} ${location}`;
    const url = new URL("https://www.googleapis.com/customsearch/v1");
    url.searchParams.set("key", GOOGLE_API_KEY);
    url.searchParams.set("cx", GOOGLE_CSE_ID);
    url.searchParams.set("q", query);
    url.searchParams.set("num", "10");

    const res = await fetch(url.toString());
    if (res.ok) {
      const data = await res.json();
      const items = (data.items || []).map((it: any) => ({
        title: it.title,
        link: it.link,
        snippet: it.snippet,
        displayLink: it.displayLink,
      }));
      results.push(...items);
    }
    
    if (results.length >= maxResults) break;
  }

  // Deduplicate by domain
  const seen = new Set<string>();
  const deduped = results.filter((r) => {
    try {
      const domain = new URL(r.link).hostname.replace(/^www\./, "");
      if (seen.has(domain)) return false;
      seen.add(domain);
      return true;
    } catch {
      return false;
    }
  });

  console.log(`✅ AGENT 1: Found ${deduped.length} unique shops`);
  return deduped.slice(0, maxResults);
}

// AGENT 2: Scraper Agent - Crawl websites
async function scraperAgent(shops: any[]) {
  console.log("🌐 AGENT 2: Scraper Agent starting...");
  
  if (!FIRECRAWL_API_KEY) {
    throw new Error("Missing FIRECRAWL_API_KEY");
  }

  const scrapedData: any[] = [];

  for (const shop of shops) {
    console.log(`  Crawling: ${shop.link}`);
    
    try {
      // Use Firecrawl to crawl the site
      const crawlRes = await fetch("https://api.firecrawl.dev/v1/crawl", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${FIRECRAWL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: shop.link,
          limit: 20,
          scrapeOptions: {
            formats: ["markdown", "html"],
            onlyMainContent: true,
          },
        }),
      });

      if (!crawlRes.ok) {
        console.error(`  Crawl failed for ${shop.link}:`, await crawlRes.text());
        continue;
      }

      const crawlData = await crawlRes.json();
      
      // Poll for completion if needed
      let jobId = crawlData.id;
      let completed = false;
      let attempts = 0;
      let crawlResults = null;

      while (!completed && attempts < 30) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s
        
        const statusRes = await fetch(`https://api.firecrawl.dev/v1/crawl/${jobId}`, {
          headers: { "Authorization": `Bearer ${FIRECRAWL_API_KEY}` },
        });
        
        const statusData = await statusRes.json();
        
        if (statusData.status === "completed") {
          completed = true;
          crawlResults = statusData.data || [];
        } else if (statusData.status === "failed") {
          console.error(`  Crawl failed for ${shop.link}`);
          break;
        }
        attempts++;
      }

      if (crawlResults && crawlResults.length > 0) {
        scrapedData.push({
          shop,
          pages: crawlResults,
        });
      }
    } catch (e) {
      console.error(`  Error crawling ${shop.link}:`, e);
    }
  }

  console.log(`✅ AGENT 2: Scraped ${scrapedData.length} shops`);
  return scrapedData;
}

// AGENT 3: Parser Agent - Extract equipment data
async function parserAgent(scrapedData: any[], shopUserId: string) {
  console.log("🔄 AGENT 3: Parser Agent starting...");
  
  if (!OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  const parsedShops: any[] = [];

  for (const { shop, pages } of scrapedData) {
    console.log(`  Parsing: ${shop.displayLink}`);
    
    const equipmentList: any[] = [];
    
    // Parse each page for equipment
    for (const page of pages) {
      if (!page.html) continue;
      
      try {
        // Call GPT-5-mini to extract equipment data
        const prompt = `Extract ski and snowboard rental equipment from this HTML. Return a JSON array of equipment objects with these fields: name, category (skis/snowboards), description, price_per_day, price_per_hour, price_per_week, size, material, suitable_skill_level (beginner/intermediate/advanced), subcategory, damage_deposit. If pricing is bundled (e.g., "$100 for 2 days"), calculate daily rate. Return empty array if no rental equipment found.`;
        
        const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-5-mini",
            messages: [
              { role: "system", content: "You are a data extraction expert. Return only valid JSON." },
              { role: "user", content: `${prompt}\n\nHTML:\n${page.html.substring(0, 8000)}` },
            ],
            max_completion_tokens: 2000,
          }),
        });

        if (aiRes.ok) {
          const aiData = await aiRes.json();
          const content = aiData.choices[0].message.content;
          
          // Try to parse JSON
          try {
            const extracted = JSON.parse(content);
            if (Array.isArray(extracted) && extracted.length > 0) {
              equipmentList.push(...extracted);
            }
          } catch {
            // Try to extract JSON from markdown code block
            const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/);
            if (jsonMatch) {
              const extracted = JSON.parse(jsonMatch[1]);
              if (Array.isArray(extracted) && extracted.length > 0) {
                equipmentList.push(...extracted);
              }
            }
          }
        }
      } catch (e) {
        console.error(`  Error parsing page:`, e);
      }
    }

    // Geocode shop address if available
    const shopAddress = shop.snippet || "";
    let coords = null;
    if (shopAddress) {
      coords = await geocodeAddress(`${shop.displayLink} ${shopAddress}`);
    }

    parsedShops.push({
      shop,
      equipment: equipmentList,
      address: shopAddress,
      coords,
      pages,
    });

    console.log(`  Extracted ${equipmentList.length} equipment items`);
  }

  console.log(`✅ AGENT 3: Parsed ${parsedShops.length} shops`);
  return parsedShops;
}

// AGENT 4: Storage Agent - Generate SQL and store
async function storageAgent(parsedShops: any[], shopUserId: string, supabaseClient: any) {
  console.log("💾 AGENT 4: Storage Agent starting...");

  let totalEquipment = 0;

  for (const { shop, equipment, address, coords, pages } of parsedShops) {
    try {
      const domain = new URL(shop.link).hostname.replace(/^www\./, "");
      
      // Generate SQL statements for all equipment
      const sqlStatements: string[] = [];
      for (const item of equipment) {
        const sql = `INSERT INTO public.equipment (
    id, user_id, name, category, description, price_per_day, price_per_hour, price_per_week,
    size, weight, material, suitable_skill_level, status,
    location_lat, location_lng, location_address, subcategory, damage_deposit, visible_on_map
) VALUES (
    gen_random_uuid(),
    '${shopUserId}',
    '${escapeSql(item.name || "Unknown")}',
    '${escapeSql(item.category || "skis")}',
    '${escapeSql(item.description || "")}',
    ${item.price_per_day || "NULL"},
    ${item.price_per_hour || "NULL"},
    ${item.price_per_week || "NULL"},
    ${item.size ? `'${escapeSql(item.size)}'` : "NULL"},
    ${item.weight ? `'${escapeSql(item.weight)}'` : "NULL"},
    ${item.material ? `'${escapeSql(item.material)}'` : "NULL"},
    ${item.suitable_skill_level ? `'${escapeSql(item.suitable_skill_level)}'` : "NULL"},
    'available',
    ${coords?.lat || "NULL"},
    ${coords?.lng || "NULL"},
    '${escapeSql(address)}',
    ${item.subcategory ? `'${escapeSql(item.subcategory)}'` : "NULL"},
    ${item.damage_deposit || "NULL"},
    true
);`;
        sqlStatements.push(sql);
      }

      const fullSql = sqlStatements.join("\n\n");

      // Extract contact info from pages
      let email = null;
      let phone = null;
      for (const page of pages) {
        if (!email && page.markdown) {
          const emailMatch = page.markdown.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
          if (emailMatch) email = emailMatch[0];
        }
        if (!phone && page.markdown) {
          const phoneMatch = page.markdown.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
          if (phoneMatch) phone = phoneMatch[0];
        }
      }

      // Store in scraped_retailers table
      const { error } = await supabaseClient.from("scraped_retailers").upsert({
        business_name: shop.title,
        business_url: shop.link,
        business_domain: domain,
        detected_categories: equipment.length > 0 ? equipment.map((e: any) => e.category).filter(Boolean) : [],
        email,
        phone,
        address,
        location_lat: coords?.lat,
        location_lng: coords?.lng,
        raw_html: pages[0]?.html?.substring(0, 50000),
        raw_markdown: pages.map((p: any) => p.markdown).join("\n\n").substring(0, 50000),
        relevant_pages: pages.map((p: any) => ({ url: p.url, title: p.metadata?.title })),
        parsed_equipment: equipment,
        generated_sql: fullSql,
        status: equipment.length > 0 ? "parsed" : "scraped",
        last_scraped_at: new Date().toISOString(),
      }, {
        onConflict: "business_url",
      });

      if (error) {
        console.error(`  Error storing ${shop.displayLink}:`, error);
      } else {
        totalEquipment += equipment.length;
        console.log(`  ✓ Stored ${equipment.length} items for ${shop.displayLink}`);
      }
    } catch (e) {
      console.error(`  Error processing shop:`, e);
    }
  }

  console.log(`✅ AGENT 4: Stored ${totalEquipment} total equipment items`);
  return { totalEquipment, totalShops: parsedShops.length };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const payload: DiscoveryPayload = await req.json().catch(() => ({}));
    
    const region = payload.region || "los-angeles";
    const categories = payload.categories || ["ski", "snowboard"];
    const maxShops = payload.maxShops || 20;

    console.log("🚀 Starting Rental Discovery Agent");
    console.log(`  Region: ${region}`);
    console.log(`  Categories: ${categories.join(", ")}`);
    console.log(`  Max shops: ${maxShops}`);

    // LA County configuration
    const LA_CONFIG = {
      location: "Los Angeles County, CA",
      radiusMiles: 50,
      keywords: categories.flatMap(cat => [
        `${cat} rental los angeles`,
        `${cat} shop rental la county`,
        `${cat} rental store los angeles`,
      ]),
    };

    // Step 1: Search for shops
    const shops = await searchAgent(
      LA_CONFIG.keywords,
      LA_CONFIG.location,
      LA_CONFIG.radiusMiles,
      maxShops
    );

    if (shops.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: "No shops found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 2: Scrape shop websites
    const scrapedData = await scraperAgent(shops.slice(0, maxShops));

    if (scrapedData.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: "No shops successfully scraped" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 3: Parse equipment data
    const SHOP_USER_ID = "73de4049-7ffd-45cd-868b-c2d0076107b3"; // Default user for scraped shops
    const parsedShops = await parserAgent(scrapedData, SHOP_USER_ID);

    // Step 4: Store in database
    const stats = await storageAgent(parsedShops, SHOP_USER_ID, supabaseClient);

    return new Response(
      JSON.stringify({
        success: true,
        stats: {
          shopsFound: shops.length,
          shopsScraped: scrapedData.length,
          shopsParsed: parsedShops.length,
          equipmentExtracted: stats.totalEquipment,
        },
        message: `Successfully discovered ${stats.totalEquipment} equipment items from ${stats.totalShops} shops`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("Agent error:", e);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: e instanceof Error ? e.message : "Unknown error" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
