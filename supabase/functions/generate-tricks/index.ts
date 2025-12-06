import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TrickRequest {
  category: string;
  subcategory?: string;
  name: string;
  specifications?: Record<string, string>;
}

interface Trick {
  name: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  description: string;
  youtubeSearchQuery: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { category, subcategory, name, specifications } = await req.json() as TrickRequest;

    const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAIApiKey) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    console.log(`Generating tricks for: ${category} - ${name}`);

    const systemPrompt = `You are an expert instructor for outdoor sports equipment. Generate a list of tricks, techniques, and skills that someone can learn with the specified equipment. Focus on practical, learnable skills ranging from beginner to advanced. Always respond with valid JSON.`;

    const userPrompt = `Generate 6-8 tricks/techniques for this equipment:
- Category: ${category}
- Subcategory: ${subcategory || "N/A"}
- Equipment Name: ${name}
- Specifications: ${specifications ? JSON.stringify(specifications) : "N/A"}

For each trick, provide:
1. A clear, concise name
2. Difficulty level (beginner, intermediate, or advanced)
3. A brief 1-2 sentence description
4. A simple YouTube search query in this exact format: "[sport] [trick name] tutorial"
   Examples:
   - "beginner surfing duckdive tutorial"
   - "intermediate surfing cutback tutorial"
   - "advanced snowboarding backside 180 tutorial"
5. DO NOT include the gear description in the YouTube query string such as "how to Pop-up surfing tutorial shortboard", not "how to Pop-up surfing tutorial shortboard Firewire Sweet Potato"

IMPORTANT: The YouTube search query must be GENERIC.
- Do NOT include the specific equipment name (e.g., "Firewire Sweet Potato", "Burton Custom")
- Do NOT include equipment specifications (e.g., "shortboard", "5'8\"", "156cm")
- ONLY include: difficulty level (optional), sport name, trick name, and "tutorial"

Respond with a JSON object containing a "tricks" array with objects having: name, difficulty, description, youtubeSearchQuery`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("OpenAI response received");

    const textContent = data.choices?.[0]?.message?.content;
    if (!textContent) {
      throw new Error("Invalid OpenAI response format");
    }

    const tricksData = JSON.parse(textContent);
    const tricks: Trick[] = tricksData.tricks;

    console.log(`Generated ${tricks.length} tricks`);

    return new Response(JSON.stringify({ tricks }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-tricks error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
