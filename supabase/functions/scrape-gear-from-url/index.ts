import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const mapCategory = (text: string): string => {
  const t = text.toLowerCase();
  if (/(snowboard|snow\s*board)/.test(t)) return "snowboards";
  if (/(\bskis?\b)/.test(t)) return "skis";
  if (/(surfboard|soft\s*top|longboard|shortboard)/.test(t)) return "surfboards";
  if (/(mountain\s*bike|mtb|full\s*suspension|hardtail)/.test(t)) return "mountain-bikes";
  return "snowboards";
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    if (!url) {
      return new Response(JSON.stringify({ error: 'Missing url' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

    if (!FIRECRAWL_API_KEY) {
      return new Response(JSON.stringify({ error: 'FIRECRAWL_API_KEY not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: 'OPENAI_API_KEY not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Scrape with Firecrawl
    const scrapeRes = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, formats: ['html', 'markdown'] }),
    });

    const scrapeJson = await scrapeRes.json();
    if (!scrapeRes.ok) {
      console.error('Firecrawl error:', scrapeJson);
      return new Response(JSON.stringify({ error: 'Failed to scrape URL', details: scrapeJson }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Normalize content
    const content = typeof scrapeJson?.markdown === 'string'
      ? scrapeJson.markdown
      : (Array.isArray(scrapeJson?.data) && scrapeJson.data[0]?.markdown) || '';

    const html = typeof scrapeJson?.html === 'string'
      ? scrapeJson.html
      : (Array.isArray(scrapeJson?.data) && scrapeJson.data[0]?.html) || '';

    const truncatedText = (content || html || '').slice(0, 12000);

    // Ask GPT-4o to extract
    const system = `You are an expert data extractor for outdoor gear (rentals or products). 
Return STRICT JSON with these keys only:
name, category, description, size, weight, material, suitable_skill_level, location_address, price_per_day, price_per_hour, price_per_week, subcategory, damage_deposit.
Rules:
- category must be one of: snowboards, skis, surfboards, mountain-bikes (map intelligently).
- If you see rental pricing, map to price_per_day / hour / week as numbers; else null.
- description should be concise (<= 180 chars if possible).
- location_address should be the shop's full postal address if available, else null.
- size, weight, material, suitable_skill_level, subcategory, damage_deposit may be null if unknown.
Return JSON only.`;

    const user = `URL: ${url}\n\nCONTENT:\n${truncatedText}`;

    const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        temperature: 0.2,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ],
      }),
    });

    const aiJson = await aiRes.json();
    if (!aiRes.ok) {
      console.error('OpenAI error:', aiJson);
      return new Response(JSON.stringify({ error: 'AI extraction failed', details: aiJson }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let extracted: any = {};
    try {
      const text = aiJson?.choices?.[0]?.message?.content || '{}';
      extracted = JSON.parse(text);
    } catch (e) {
      console.warn('Failed to parse AI JSON, falling back');
      extracted = {};
    }

    // Ensure category mapping
    if (extracted?.category) {
      extracted.category = mapCategory(String(extracted.category));
    } else {
      const probe = `${url} ${content}`;
      extracted.category = mapCategory(probe);
    }

    return new Response(JSON.stringify(extracted), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('scrape-gear-from-url error:', error);
    return new Response(JSON.stringify({ error: error?.message || 'Unexpected error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
