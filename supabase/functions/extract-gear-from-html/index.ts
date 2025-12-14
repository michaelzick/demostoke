import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");

function mapCategory(text: string): string {
  const t = (text || "").toLowerCase();
  if (t.includes("snow")) return "snowboards";
  if (t.includes("ski")) return "skis";
  if (t.includes("surf")) return "surfboards";
  if (t.includes("bike") || t.includes("mtb") || t.includes("mountain")) return "bikes";
  return "snowboards";
}

function mapSubcategory(category: string, text: string | null): string | null {
  if (!text) return null;
  const t = text.toLowerCase();
  
  if (category === "bikes") {
    if (t.includes("mountain") || t.includes("mtb") || t.includes("trail") || t.includes("enduro") || t.includes("downhill")) {
      return "mountain-bikes";
    }
    if (t.includes("road")) return "road-bikes";
    if (t.includes("gravel")) return "gravel-bikes";
    if (t.includes("e-bike") || t.includes("electric")) return "e-bikes";
  }
  
  return text;
}

async function extractFromHtml(html: string) {
  const prompt = `You are an expert data extractor for outdoor gear rental listings.

Extract a single gear item from the provided HTML and return STRICT JSON with these keys:
{
  "name": string,                      // product or gear name (required)
  "category": string,                  // one of: snowboards | skis | surfboards | bikes
  "description": string,               // concise description (may be empty)
  "sizes": string[],                   // ARRAY of available sizes (e.g., ["Small", "Medium", "Large", "XL"])
  "weight": string|null,
  "material": string|null,
  "suitable_skill_level": string|null, // e.g., beginner, intermediate, advanced
  "subcategory": string|null,          // e.g., all-mountain, twin-tip, soft-top, mountain-bikes
  "damage_deposit": number|null,
  "price_per_day": number|null,
  "price_per_hour": number|null,
  "price_per_week": number|null
}

IMPORTANT FOR SIZES:
- Extract ALL available sizes as an array
- Common size formats: S, M, L, XL, XXL, Small, Medium, Large, Extra Large
- For bikes: XS, S, M, L, XL or Small, Medium, Large, Extra Large
- For boards: Length measurements like 156cm, 160cm or descriptive sizes
- If only one size is available, return it as a single-element array

- Infer fields conservatively from HTML.
- If a numeric value is present, return it as a number (no currency symbols).
- If unknown or missing, return null for single values or empty array for sizes.
- Do NOT include any extra keys.
- Respond with JSON only.`;

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${openAIApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-5-mini",
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: html.slice(0, 200000) },
      ],
      max_completion_tokens: 2000,
    }),
  });

  const data = await resp.json();
  const content = data?.choices?.[0]?.message?.content || "";

  // Try strict JSON parse; if it fails, try to salvage JSON fragment
  try {
    return JSON.parse(content);
  } catch {
    const start = content.indexOf("{");
    const end = content.lastIndexOf("}");
    if (start >= 0 && end > start) {
      const maybe = content.slice(start, end + 1);
      try {
        return JSON.parse(maybe);
      } catch {
        // Fall through to error
      }
    }
    throw new Error("Failed to parse AI JSON");
  }
}

function escapeSQL(value: string | null): string {
  if (value === null) return "NULL";
  // Escape single quotes by doubling them
  return `'${value.replace(/'/g, "''")}'`;
}

function formatSizes(sizes: string[] | null): string {
  if (!sizes || sizes.length === 0) return "NULL";
  // Join sizes with comma and space
  const joined = sizes.join(", ");
  return escapeSQL(joined);
}

function generateSQL(data: {
  name: string;
  category: string;
  description: string;
  sizes: string[] | null;
  weight: string | null;
  material: string | null;
  suitable_skill_level: string | null;
  subcategory: string | null;
  damage_deposit: number | null;
  price_per_day: number | null;
  price_per_hour: number | null;
  price_per_week: number | null;
}): string {
  const sql = `INSERT INTO public.equipment (
    id, user_id, name, category, description, price_per_day, price_per_hour, price_per_week,
    size, weight, material, suitable_skill_level, status,
    location_lat, location_lng, location_address, subcategory, damage_deposit, visible_on_map
) VALUES
(
    gen_random_uuid(),
    'REPLACE_WITH_USER_ID',
    ${escapeSQL(data.name)},
    ${escapeSQL(data.category)},
    ${escapeSQL(data.description)},
    ${data.price_per_day ?? "NULL"}, ${data.price_per_hour ?? "NULL"}, ${data.price_per_week ?? "NULL"},
    ${formatSizes(data.sizes)},
    ${escapeSQL(data.weight)},
    ${escapeSQL(data.material)},
    ${escapeSQL(data.suitable_skill_level)},
    'available',
    (SELECT location_lat FROM public.profiles WHERE id = 'REPLACE_WITH_USER_ID'),
    (SELECT location_lng FROM public.profiles WHERE id = 'REPLACE_WITH_USER_ID'),
    (SELECT address FROM public.profiles WHERE id = 'REPLACE_WITH_USER_ID'),
    ${escapeSQL(data.subcategory)},
    ${data.damage_deposit ?? "NULL"},
    true
);`;

  return sql;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      return new Response(JSON.stringify({ error: "OPENAI_API_KEY is not set" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { html } = await req.json();
    if (!html || typeof html !== "string") {
      return new Response(JSON.stringify({ error: "Missing 'html' in request body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const raw = await extractFromHtml(html);
    const category = mapCategory(raw?.category || "");
    
    const normalized = {
      name: raw?.name || "Unknown",
      category: category,
      description: raw?.description || "",
      sizes: Array.isArray(raw?.sizes) ? raw.sizes : (raw?.size ? [raw.size] : null),
      weight: raw?.weight ?? null,
      material: raw?.material ?? null,
      suitable_skill_level: raw?.suitable_skill_level ?? null,
      subcategory: mapSubcategory(category, raw?.subcategory) ?? null,
      damage_deposit: raw?.damage_deposit ?? null,
      price_per_day: raw?.price_per_day ?? null,
      price_per_hour: raw?.price_per_hour ?? null,
      price_per_week: raw?.price_per_week ?? null,
    };

    const sql = generateSQL(normalized);

    return new Response(JSON.stringify({ ...normalized, sql }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: unknown) {
    console.error("extract-gear-from-html error:", e);
    const message = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
