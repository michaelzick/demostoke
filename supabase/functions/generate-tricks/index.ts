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
    
    const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");
    if (!GOOGLE_API_KEY) {
      throw new Error("GOOGLE_API_KEY is not configured");
    }

    console.log(`Generating tricks for: ${category} - ${name}`);

    const systemPrompt = `You are an expert instructor for outdoor sports equipment. Generate a list of tricks, techniques, and skills that someone can learn with the specified equipment. Focus on practical, learnable skills ranging from beginner to advanced.`;

    const userPrompt = `Generate 6-8 tricks/techniques for this equipment:
- Category: ${category}
- Subcategory: ${subcategory || "N/A"}
- Equipment Name: ${name}
- Specifications: ${specifications ? JSON.stringify(specifications) : "N/A"}

For each trick, provide:
1. A clear, concise name
2. Difficulty level (beginner, intermediate, or advanced)
3. A brief 1-2 sentence description
4. An optimized YouTube search query to find tutorial videos (include the sport name and "tutorial" or "how to")

Respond with a JSON object containing a "tricks" array with objects having: name, difficulty, description, youtubeSearchQuery`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GOOGLE_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              tricks: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    difficulty: { type: "string", enum: ["beginner", "intermediate", "advanced"] },
                    description: { type: "string" },
                    youtubeSearchQuery: { type: "string" }
                  },
                  required: ["name", "difficulty", "description", "youtubeSearchQuery"]
                }
              }
            },
            required: ["tricks"]
          }
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google Gemini API error:", response.status, errorText);
      throw new Error(`Google Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Gemini response received");

    // Extract the JSON content from Gemini's response
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textContent) {
      throw new Error("Invalid Gemini response format");
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
