import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type CreateShopBody = {
  shopName?: string;
  email?: string;
  password?: string;
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

function createUniqueShopSlug(shopName: string) {
  const base = slugify(shopName) || "shop";
  return `${base}-${Date.now().toString(36)}${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

async function insertShopWithUniqueSlug(adminClient: ReturnType<typeof createClient>, ownerId: string, shopName: string, email: string) {
  let lastError: unknown = null;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const slug = createUniqueShopSlug(shopName);
    const { data, error } = await adminClient
      .from("fleetops_shops")
      .insert({
        owner_id: ownerId,
        name: shopName,
        slug,
        contact_email: email,
      })
      .select("id, slug")
      .single();

    if (!error && data) {
      return data;
    }

    lastError = error;
    if (error?.code !== "23505") {
      break;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Unable to create shop.");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    return jsonResponse(
      { error: "Missing required Supabase environment variables." },
      500
    );
  }

  const authorization = req.headers.get("Authorization");
  if (!authorization) {
    return jsonResponse({ error: "Unauthorized." }, 401);
  }

  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authorization } },
  });
  const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
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

    let body: CreateShopBody;
    try {
      body = (await req.json()) as CreateShopBody;
    } catch {
      return jsonResponse({ error: "Invalid JSON body." }, 400);
    }

    const shopName = body.shopName?.trim() ?? "";
    const email = body.email?.trim().toLowerCase() ?? "";
    const password = body.password ?? "";

    if (!shopName || !email || !password) {
      return jsonResponse(
        { error: "shopName, email, and password are required." },
        400
      );
    }

    if (password.length < 8) {
      return jsonResponse(
        { error: "Password must be at least 8 characters long." },
        400
      );
    }

    const { data: createdUserData, error: createUserError } =
      await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          shop_name: shopName,
        },
      });

    if (createUserError) {
      return jsonResponse({ error: createUserError.message }, 400);
    }

    const createdUserId = createdUserData.user?.id;
    if (!createdUserId) {
      return jsonResponse({ error: "User creation failed." }, 500);
    }

    try {
      const { error: roleError } = await adminClient.from("fleetops_user_roles").insert({
        user_id: createdUserId,
        role: "shop",
        assigned_by: user.id,
      });

      if (roleError) {
        throw roleError;
      }

      const createdShop = await insertShopWithUniqueSlug(
        adminClient,
        createdUserId,
        shopName,
        email
      );

      return jsonResponse({
        userId: createdUserId,
        shopId: createdShop.id,
        shopSlug: createdShop.slug,
      });
    } catch (error) {
      await adminClient.auth.admin.deleteUser(createdUserId).catch(() => null);
      throw error;
    }
  } catch (error) {
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : "Failed to create shop.",
      },
      500
    );
  }
});
