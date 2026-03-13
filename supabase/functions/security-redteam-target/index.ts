import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type WebhookRequest = {
  prompt?: string;
  config?: {
    targetId?: string;
    sharedSecret?: string;
  };
};

type TargetDefinition = {
  functionName: string;
  requiresAuth?: boolean;
  buildBody: (prompt: string) => Record<string, unknown>;
};

type AuthCache = {
  accessToken: string;
  expiresAt: number;
};

let cachedAuth: AuthCache | null = null;

const aiSearchFixture = [
  {
    id: "surf-1",
    name: "CI Mid",
    category: "surfboards",
    description: "A forgiving intermediate surfboard for Malibu point breaks.",
    price_per_day: 65,
    rating: 4.9,
    distance: 12,
    specifications: {
      suitable: "Intermediate",
      brand: "Channel Islands",
      material: "PU",
      size: "6'10\"",
    },
    location: {
      address: "Malibu, California",
    },
  },
  {
    id: "snow-1",
    name: "Burton Custom",
    category: "snowboards",
    description: "All-mountain snowboard for Tahoe riders looking for pop and stability.",
    price_per_day: 55,
    rating: 4.8,
    distance: 95,
    specifications: {
      suitable: "Advanced",
      brand: "Burton",
      material: "Carbon",
      size: "156cm",
    },
    location: {
      address: "Truckee, California",
    },
  },
];

const targets: Record<string, TargetDefinition> = {
  "ai-search": {
    functionName: "ai-search",
    buildBody: (prompt) => ({
      query: prompt,
      equipment: aiSearchFixture,
      userLocation: {
        lat: 34.0356,
        lng: -118.6892,
      },
    }),
  },
  "gear-quiz-analysis": {
    functionName: "gear-quiz-analysis",
    buildBody: (prompt) => ({
      category: "surfboards",
      height: "5'10\"",
      weight: "180",
      age: "32",
      sex: "male",
      skillLevel: "intermediate",
      locations: "Malibu, California",
      currentGear: `Current gear and request: ${prompt}`,
      additionalNotes: prompt,
    }),
  },
  "generate-tricks": {
    functionName: "generate-tricks",
    buildBody: (prompt) => ({
      category: "surfboards",
      subcategory: "shortboard",
      name: prompt,
      specifications: {
        size: "6'0\"",
        fin_setup: "thruster",
      },
    }),
  },
  "generate-description": {
    functionName: "generate-description",
    requiresAuth: true,
    buildBody: (prompt) => ({
      gearName: prompt,
      gearType: "surfboard",
    }),
  },
  "generate-description-rewrite": {
    functionName: "generate-description",
    requiresAuth: true,
    buildBody: (prompt) => ({
      gearName: "Promptfoo Security Test Board",
      gearType: "surfboard",
      existingText: prompt,
      mode: "rewrite",
    }),
  },
  "generate-blog-text": {
    functionName: "generate-blog-text",
    requiresAuth: true,
    buildBody: (prompt) => ({
      prompt,
      category: "surfboards",
    }),
  },
  "analyze-blog-seo": {
    functionName: "analyze-blog-seo",
    requiresAuth: true,
    buildBody: (prompt) => ({
      title: "Promptfoo Security Regression Test",
      excerpt: prompt.slice(0, 160),
      content: `<h2>Promptfoo Security Test</h2><p>${prompt}</p>`,
      category: "surfboards",
    }),
  },
};

const jsonResponse = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const extractOutput = (targetId: string, payload: unknown) => {
  if (typeof payload === "string") {
    return payload;
  }

  if (!payload || typeof payload !== "object") {
    return JSON.stringify(payload ?? null);
  }

  const data = payload as Record<string, unknown>;

  if (targetId === "generate-description" || targetId === "generate-description-rewrite") {
    return typeof data.description === "string" ? data.description : JSON.stringify(data);
  }

  if (targetId === "generate-blog-text") {
    return [data.title, data.excerpt, data.content]
      .filter((value): value is string => typeof value === "string" && value.length > 0)
      .join("\n\n");
  }

  if (targetId === "generate-tricks" && Array.isArray(data.tricks)) {
    return JSON.stringify(data.tricks);
  }

  if (targetId === "gear-quiz-analysis" && Array.isArray(data.recommendations)) {
    return JSON.stringify(data);
  }

  return JSON.stringify(data);
};

const getTestUserAccessToken = async (supabaseUrl: string, supabaseAnonKey: string) => {
  if (cachedAuth && cachedAuth.expiresAt > Date.now() + 30_000) {
    return cachedAuth.accessToken;
  }

  const email = Deno.env.get("PROMPTFOO_TEST_USER_EMAIL");
  const password = Deno.env.get("PROMPTFOO_TEST_USER_PASSWORD");
  if (!email || !password) {
    throw new Error("Authenticated target requested but PROMPTFOO_TEST_USER_EMAIL/PASSWORD are not configured");
  }

  const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: supabaseAnonKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.access_token) {
    throw new Error(`Failed to obtain test user token: ${JSON.stringify(data)}`);
  }

  cachedAuth = {
    accessToken: data.access_token,
    expiresAt: Date.now() + (typeof data.expires_in === "number" ? data.expires_in * 1000 : 3_600_000),
  };

  return cachedAuth.accessToken;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  const sharedSecret = Deno.env.get("PROMPTFOO_REDTEAM_SHARED_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!sharedSecret || !supabaseUrl || !supabaseAnonKey) {
    return jsonResponse(500, { error: "Missing required environment variables" });
  }

  let body: WebhookRequest;
  try {
    body = (await req.json()) as WebhookRequest;
  } catch {
    return jsonResponse(400, { error: "Invalid JSON body" });
  }

  if (body.config?.sharedSecret !== sharedSecret) {
    return jsonResponse(401, { error: "Unauthorized" });
  }

  const prompt = body.prompt?.trim();
  const targetId = body.config?.targetId?.trim();
  if (!prompt || !targetId) {
    return jsonResponse(400, { error: "prompt and config.targetId are required" });
  }

  const target = targets[targetId];
  if (!target) {
    return jsonResponse(400, { error: `Unknown targetId: ${targetId}` });
  }

  try {
    const authToken = target.requiresAuth
      ? await getTestUserAccessToken(supabaseUrl, supabaseAnonKey)
      : null;

    const response = await fetch(`${supabaseUrl}/functions/v1/${target.functionName}`, {
      method: "POST",
      headers: {
        apikey: supabaseAnonKey,
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: JSON.stringify(target.buildBody(prompt)),
    });

    const rawText = await response.text();
    let data: unknown = rawText;
    try {
      data = rawText ? JSON.parse(rawText) : null;
    } catch {
      // Keep the raw text when the downstream response is not JSON.
    }

    if (!response.ok) {
      return jsonResponse(response.status, {
        error: "Target invocation failed",
        targetId,
        details: data,
      });
    }

    return jsonResponse(200, {
      output: extractOutput(targetId, data),
      targetId,
      functionName: target.functionName,
      raw: data,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonResponse(500, { error: message, targetId });
  }
});
