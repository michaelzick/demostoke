import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function getBearerToken(header: string | null) {
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token;
}

const SYSTEM_PROMPT = `You are an expert analytics advisor for gear rental businesses (surfboards, snowboards, skis, mountain bikes, etc.). You analyze booking and revenue data to provide actionable business insights.

Given the shop's analytics data, provide a concise analysis with these sections:

## Revenue Forecast
Predict revenue trends for the next 30 days based on historical patterns.

## Peak Booking Periods
Identify when demand is highest and recommend preparation strategies.

## Equipment Demand
Highlight which gear categories and items are most/least popular, and suggest inventory adjustments.

## Seasonal Trends
Note any seasonal patterns and how the shop should prepare.

## Recommendations
Provide 3-5 specific, actionable recommendations for pricing, inventory, or operations.

Keep your response concise and data-driven. Use specific numbers from the provided data. Format with markdown headers and bullet points.`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!supabaseUrl || !supabaseAnonKey) {
      return jsonResponse(
        { error: "Missing required Supabase environment variables." },
        500
      );
    }

    const authorization = req.headers.get("Authorization");
    const accessToken = getBearerToken(authorization);
    if (!accessToken || !authorization) {
      return jsonResponse({ error: "Unauthorized." }, 401);
    }

    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authorization } },
    });
    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser();

    if (authError || !user) {
      return jsonResponse({ error: "Unauthorized." }, 401);
    }

    const { data: isAdmin, error: adminError } = await authClient.rpc("fleetops_is_admin");
    if (adminError || isAdmin !== true) {
      return jsonResponse({ error: "Forbidden." }, 403);
    }

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      return jsonResponse(
        { error: "OpenAI API key not configured." },
        500
      );
    }

    const body = await req.json();
    const { stats } = body;

    if (!stats) {
      return jsonResponse({ error: "Stats payload is required." }, 400);
    }

    const userPrompt = `Here is the analytics data for this gear rental shop:

**Selected Period:** ${stats.dateRange?.from ?? "N/A"} to ${stats.dateRange?.to ?? "N/A"}

**Key Metrics:**
- Total Revenue: $${stats.totalRevenue?.toLocaleString() ?? 0}
- Total Bookings: ${stats.totalBookings ?? 0}
- Average Booking Value: $${stats.avgBookingValue ?? 0}
- Total Equipment Items: ${stats.totalEquipment ?? 0}

**Revenue by Month (last 6 months):**
${(stats.revenueByMonth ?? []).map((m: { month: string; revenue: number }) => `- ${m.month}: $${m.revenue.toLocaleString()}`).join("\n") || "No monthly data available"}

**Top Categories:**
${(stats.topCategories ?? []).map((c: { category: string; bookings: number; revenue: number }) => `- ${c.category}: ${c.bookings} bookings, $${c.revenue.toLocaleString()} revenue`).join("\n") || "No category data available"}

**Status Breakdown:**
${Object.entries(stats.statusBreakdown ?? {}).map(([status, count]) => `- ${status}: ${count}`).join("\n") || "No status data available"}

Please analyze this data and provide insights and predictions.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5.4-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        max_completion_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error("OpenAI API error:", response.status, errBody);
      return jsonResponse(
        { error: "Failed to get AI response. Please try again." },
        502
      );
    }

    const result = await response.json();
    const insights =
      result.choices?.[0]?.message?.content ?? "No insights generated.";

    return jsonResponse({ insights });
  } catch (error) {
    console.error("ai-analytics error:", error);
    return jsonResponse(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate analytics insights.",
      },
      500
    );
  }
});
