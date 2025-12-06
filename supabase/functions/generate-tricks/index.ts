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
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
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
4. An optimized YouTube search query to find tutorial videos (include the sport name and "tutorial" or "how to")`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_tricks",
              description: "Return the generated list of tricks and techniques",
              parameters: {
                type: "object",
                properties: {
                  tricks: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string", description: "Name of the trick or technique" },
                        difficulty: { 
                          type: "string", 
                          enum: ["beginner", "intermediate", "advanced"],
                          description: "Skill level required"
                        },
                        description: { type: "string", description: "Brief 1-2 sentence description" },
                        youtubeSearchQuery: { type: "string", description: "Optimized YouTube search query for tutorials" }
                      },
                      required: ["name", "difficulty", "description", "youtubeSearchQuery"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["tricks"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "return_tricks" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response received");

    // Extract tricks from tool call response
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "return_tricks") {
      throw new Error("Invalid AI response format");
    }

    const tricksData = JSON.parse(toolCall.function.arguments);
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
