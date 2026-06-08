import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const DEMO_LIGHTSPEED_CREDENTIALS = {
  accountId: "LS-DEMO-12345",
  accessToken: "lsdemo_pat_4f8a1c9e7b3d2056",
};

const DEMO_BOOQABLE_CREDENTIALS = {
  companySlug: "demostoke-rentals",
  accessToken: "bqdemo_tok_91x7y3z8a2b6c4d0",
};

const MOCK_SOURCES = [
  {
    id: "summit-and-surf",
    category: "Surfboards",
    manufacturer: "Channel Islands",
    image:
      "https://images.unsplash.com/photo-1502680390548-bdbac40e4ce9?w=400",
  },
  {
    id: "powder-hound-skis",
    category: "Skis",
    manufacturer: "Rossignol",
    image:
      "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400",
  },
  {
    id: "edge-and-carve-boards",
    category: "Snowboards",
    manufacturer: "Burton",
    image:
      "https://images.unsplash.com/photo-1522056615691-da7cfe4d0c3e?w=400",
  },
  {
    id: "tidewater-surf-shop",
    category: "Surfboards",
    manufacturer: "Firewire",
    image:
      "https://images.unsplash.com/photo-1531722569936-825d3dd91b15?w=400",
  },
  {
    id: "trailhead-bikes",
    category: "Mountain Bikes",
    manufacturer: "Trek",
    image:
      "https://images.unsplash.com/photo-1576858574144-9ae1ebcf5ae5?w=800&auto=format&fit=crop",
  },
];

const DEFAULT_LOCATION = {
  lat: 37.6308,
  lng: -119.0326,
  address: "Mammoth Lakes, CA",
};

type SeedBody = {
  source?: "cron" | "manual";
  force?: boolean;
  shopId?: string;
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function timingSafeEqualString(actual: string, expected: string) {
  const encoder = new TextEncoder();
  const actualBytes = encoder.encode(actual);
  const expectedBytes = encoder.encode(expected);

  if (actualBytes.length !== expectedBytes.length) return false;

  let diff = 0;
  for (let i = 0; i < actualBytes.length; i += 1) {
    diff |= actualBytes[i] ^ expectedBytes[i];
  }
  return diff === 0;
}

async function readBody(req: Request): Promise<SeedBody> {
  try {
    return (await req.json()) as SeedBody;
  } catch {
    return {};
  }
}

function isDemoLightspeedConnection(connection: Record<string, unknown>) {
  const credentials = (connection.credentials ?? {}) as Record<string, unknown>;
  return (
    credentials.accountId === DEMO_LIGHTSPEED_CREDENTIALS.accountId &&
    credentials.accessToken === DEMO_LIGHTSPEED_CREDENTIALS.accessToken
  );
}

async function findTargetShop(
  supabase: ReturnType<typeof createClient>,
  requestedShopId?: string
) {
  if (requestedShopId) {
    const { data, error } = await supabase
      .from("fleetops_shops")
      .select("id, owner_id, name")
      .eq("id", requestedShopId)
      .single();
    if (error || !data) throw error ?? new Error("Requested shop not found.");
    return data;
  }

  const { data: connections, error: connectionError } = await supabase
    .from("fleetops_pos_connections")
    .select("id, shop_id, provider, credentials, is_connected")
    .eq("provider", "lightspeed");

  if (connectionError) throw connectionError;

  const lightspeedConnection = (connections ?? []).find(
    isDemoLightspeedConnection
  );
  if (!lightspeedConnection) {
    throw new Error("No Lightspeed demo POS connection found.");
  }

  const { data: shop, error: shopError } = await supabase
    .from("fleetops_shops")
    .select("id, owner_id, name")
    .eq("id", lightspeedConnection.shop_id)
    .single();
  if (shopError || !shop) throw shopError ?? new Error("Target shop not found.");
  return shop;
}

async function ensureConnection(
  supabase: ReturnType<typeof createClient>,
  shopId: string,
  provider: "lightspeed" | "booqable",
  credentials: Record<string, string>,
  mockShopId: string
) {
  const { data: existing, error: existingError } = await supabase
    .from("fleetops_pos_connections")
    .select("id, shop_id, provider, credentials, is_connected")
    .eq("shop_id", shopId)
    .eq("provider", provider)
    .maybeSingle();

  if (existingError) throw existingError;

  const mergedCredentials = {
    ...((existing?.credentials ?? {}) as Record<string, unknown>),
    ...credentials,
    mockShopId,
  };

  if (existing) {
    const { data, error } = await supabase
      .from("fleetops_pos_connections")
      .update({
        is_connected: true,
        credentials: mergedCredentials,
      })
      .eq("id", existing.id)
      .select("id, shop_id, provider, credentials, is_connected")
      .single();

    if (error || !data) throw error ?? new Error(`Failed to update ${provider}.`);
    return data;
  }

  const { data, error } = await supabase
    .from("fleetops_pos_connections")
    .insert({
      shop_id: shopId,
      provider,
      is_connected: true,
      credentials: mergedCredentials,
    })
    .select("id, shop_id, provider, credentials, is_connected")
    .single();

  if (error || !data) throw error ?? new Error(`Failed to create ${provider}.`);
  return data;
}

async function nextSequence(supabase: ReturnType<typeof createClient>) {
  const { data, error } = await supabase
    .from("fleetops_pos_inventory_seed_runs")
    .select("generated_sequence")
    .order("generated_sequence", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return Number(data?.generated_sequence ?? 0) + 1;
}

function buildSeedPayload(sequence: number, source: (typeof MOCK_SOURCES)[number]) {
  const padded = String(sequence).padStart(4, "0");
  const itemSuffix = `${source.category.replace(/[^A-Za-z]/g, "").toUpperCase()}-${padded}`;
  const price = 28 + (sequence % 7) * 4;
  const name = `Demo Sync ${source.category.slice(0, -1) || source.category} ${padded}`;
  const bookingStory = `${name} was added by the scheduled POS seed to keep the demo inventory changing like a live ${source.category.toLowerCase()} rental catalog.`;

  return {
    lightspeed: {
      item_id: `LS-AUTO-${itemSuffix}`,
      description: name,
      category: source.category,
      manufacturer: source.manufacturer,
      price,
      image_url: source.image,
      booking_story: bookingStory,
    },
    booqable: {
      product_id: `BQ-AUTO-${itemSuffix}`,
      name,
      base_price_in_cents: Math.round(price * 100),
      photo_url: source.image,
      product_type: "rental",
      group_name: source.category,
      description: bookingStory,
      sku: `BQ-${itemSuffix}`,
      booking_story: bookingStory,
    },
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  const expectedSecret = Deno.env.get("FLEETOPS_POS_INVENTORY_SEED_CRON_SECRET") || Deno.env.get("POS_INVENTORY_SEED_CRON_SECRET")?.trim();
  const suppliedSecret = req.headers.get("x-cron-secret")?.trim() ?? "";
  if (
    !expectedSecret ||
    !timingSafeEqualString(suppliedSecret, expectedSecret)
  ) {
    return jsonResponse({ error: "Unauthorized." }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse(
      { error: "Missing required Supabase environment variables." },
      500
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const body = await readBody(req);
  const source = body.source === "manual" ? "manual" : "cron";
  let runId: string | null = null;

  try {
    const targetShop = await findTargetShop(supabase, body.shopId);
    const sequence = await nextSequence(supabase);
    const mockSource = MOCK_SOURCES[(sequence - 1) % MOCK_SOURCES.length];
    const payload = buildSeedPayload(sequence, mockSource);

    const lightspeedConnection = await ensureConnection(
      supabase,
      targetShop.id,
      "lightspeed",
      DEMO_LIGHTSPEED_CREDENTIALS,
      mockSource.id
    );
    const booqableConnection = await ensureConnection(
      supabase,
      targetShop.id,
      "booqable",
      DEMO_BOOQABLE_CREDENTIALS,
      mockSource.id
    );

    const { data: run, error: runError } = await supabase
      .from("fleetops_pos_inventory_seed_runs")
      .insert({
        source,
        status: "running",
        target_shop_id: targetShop.id,
        target_owner_id: targetShop.owner_id,
        lightspeed_pos_connection_id: lightspeedConnection.id,
        booqable_pos_connection_id: booqableConnection.id,
        mock_shop_id: mockSource.id,
        generated_sequence: sequence,
        lightspeed_item_id: payload.lightspeed.item_id,
        booqable_product_id: payload.booqable.product_id,
      })
      .select("id")
      .single();

    if (runError || !run) {
      throw runError ?? new Error("Failed to create seed run.");
    }
    runId = run.id;

    const { data: lightspeedItem, error: lightspeedError } = await supabase
      .from("fleetops_lightspeed_inventory_items")
      .upsert(
        {
          shop_id: targetShop.id,
          owner_id: targetShop.owner_id,
          pos_connection_id: lightspeedConnection.id,
          mock_shop_id: mockSource.id,
          location: DEFAULT_LOCATION,
          raw_payload: {
            Item: {
              itemID: payload.lightspeed.item_id,
              description: payload.lightspeed.description,
              Category: { name: payload.lightspeed.category },
              Manufacturer: { name: payload.lightspeed.manufacturer },
              Prices: {
                ItemPrice: [
                  {
                    amount: String(payload.lightspeed.price),
                    useType: "Default",
                  },
                ],
              },
              Images: {
                Image: [{ baseImageURL: payload.lightspeed.image_url }],
              },
            },
          },
          ...payload.lightspeed,
        },
        { onConflict: "pos_connection_id,item_id" }
      )
      .select("id, item_id")
      .single();

    if (lightspeedError || !lightspeedItem) {
      throw lightspeedError ?? new Error("Failed to seed Lightspeed item.");
    }

    const { data: booqableItem, error: booqableError } = await supabase
      .from("fleetops_booqable_inventory_items")
      .upsert(
        {
          shop_id: targetShop.id,
          owner_id: targetShop.owner_id,
          pos_connection_id: booqableConnection.id,
          mock_shop_id: mockSource.id,
          location: DEFAULT_LOCATION,
          raw_payload: {
            data: {
              id: payload.booqable.product_id,
              type: "products",
              attributes: payload.booqable,
            },
          },
          ...payload.booqable,
        },
        { onConflict: "pos_connection_id,product_id" }
      )
      .select("id, product_id")
      .single();

    if (booqableError || !booqableItem) {
      throw booqableError ?? new Error("Failed to seed Booqable item.");
    }

    const { count: lightspeedVerification, error: lightspeedVerifyError } =
      await supabase
        .from("fleetops_lightspeed_inventory_items")
        .select("id", { count: "exact", head: true })
        .eq("id", lightspeedItem.id);

    if (lightspeedVerifyError) throw lightspeedVerifyError;

    const { count: booqableVerification, error: booqableVerifyError } =
      await supabase
        .from("fleetops_booqable_inventory_items")
        .select("id", { count: "exact", head: true })
        .eq("id", booqableItem.id);

    if (booqableVerifyError) throw booqableVerifyError;

    const verificationCounts = {
      lightspeed: lightspeedVerification ?? 0,
      booqable: booqableVerification ?? 0,
    };

    if (verificationCounts.lightspeed !== 1 || verificationCounts.booqable !== 1) {
      throw new Error("Seed verification failed.");
    }

    const result = {
      status: "success",
      source,
      shopId: targetShop.id,
      sequence,
      mockShopId: mockSource.id,
      lightspeedItemId: lightspeedItem.item_id,
      booqableProductId: booqableItem.product_id,
      verificationCounts,
    };

    await supabase
      .from("fleetops_pos_inventory_seed_runs")
      .update({
        status: "success",
        lightspeed_inventory_item_id: lightspeedItem.id,
        booqable_inventory_item_id: booqableItem.id,
        verification_counts: verificationCounts,
        raw_result: result,
        completed_at: new Date().toISOString(),
      })
      .eq("id", runId);

    return jsonResponse(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (runId) {
      await supabase
        .from("fleetops_pos_inventory_seed_runs")
        .update({
          status: "error",
          error_message: message,
          completed_at: new Date().toISOString(),
        })
        .eq("id", runId);
    }

    return jsonResponse({ error: message }, 500);
  }
});
