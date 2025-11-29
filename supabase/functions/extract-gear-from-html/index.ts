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
  if (t.includes("bike") || t.includes("mtb") || t.includes("mountain")) return "mountain-bikes";
  return "snowboards";
}

async function extractFromHtml(html: string) {
  const prompt = `You are an expert data extractor for outdoor gear rental listings.\n\nExtract a single gear item from the provided HTML and return STRICT JSON with these keys: \n{
    "name": string,                      // product or gear name (required)
    "category": string,                  // one of: snowboards | skis | surfboards | mountain-bikes
    "description": string,               // concise description (may be empty)
    "size": string|null,
    "weight": string|null,
    "material": string|null,
    "suitable_skill_level": string|null, // e.g., beginner, intermediate, advanced
    "subcategory": string|null,          // e.g., all-mountain, twin-tip, soft-top, e-bike
    "damage_deposit": number|null,
    "price_per_day": number|null,
    "price_per_hour": number|null,
    "price_per_week": number|null,
    "location_address": string|null      // full address if present
}\n\n- Infer fields conservatively from HTML.\n- If a numeric value is present, return it as a number (no currency symbols).\n- If unknown or missing, return null.\n- Do NOT include any extra keys.\n- Respond with JSON only.`;

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
      } catch {}
    }
    throw new Error("Failed to parse AI JSON");
  }
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
    const normalized = {
      name: raw?.name || "Unknown",
      category: mapCategory(raw?.category || ""),
      description: raw?.description || "",
      size: raw?.size ?? null,
      weight: raw?.weight ?? null,
      material: raw?.material ?? null,
      suitable_skill_level: raw?.suitable_skill_level ?? null,
      subcategory: raw?.subcategory ?? null,
      damage_deposit: raw?.damage_deposit ?? null,
      price_per_day: raw?.price_per_day ?? null,
      price_per_hour: raw?.price_per_hour ?? null,
      price_per_week: raw?.price_per_week ?? null,
      location_address: raw?.location_address ?? null,
    };

    return new Response(JSON.stringify(normalized), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("extract-gear-from-html error:", e);
    return new Response(JSON.stringify({ error: String(e?.message || e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
