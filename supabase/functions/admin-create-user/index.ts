import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const categoryAssets: Record<string, { avatar_url: string; hero_image_url: string }> = {
  surfboards: {
    avatar_url:
      "https://qtlhqsqanbxgfbcjigrl.supabase.co/storage/v1/object/public/profile-images/73de4049-7ffd-45cd-868b-c2d0076107b3/profile-1752863282257.png",
    hero_image_url:
      "https://images.unsplash.com/photo-1502680390469-be75c86b636f?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  snowboards: {
    avatar_url:
      "https://qtlhqsqanbxgfbcjigrl.supabase.co/storage/v1/object/public/profile-images/c5b450a8-7414-463b-b863-d78698fd0f95/profile-1752636842828.png",
    hero_image_url:
      "https://images.unsplash.com/photo-1590461283969-47fedf408cfd?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  skis: {
    avatar_url:
      "https://qtlhqsqanbxgfbcjigrl.supabase.co/storage/v1/object/public/profile-images/7ef925ac-4b8f-496c-b4d9-10895164f03c/profile-1769637319540.png",
    hero_image_url:
      "https://images.unsplash.com/photo-1509791413599-93ba127a66b7?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  "mountain-bikes": {
    avatar_url:
      "https://qtlhqsqanbxgfbcjigrl.supabase.co/storage/v1/object/public/profile-images/ad2ad153-bb35-4e88-bfb0-d0d4f85ba62f/profile-1752637760487.png",
    hero_image_url:
      "https://images.unsplash.com/photo-1506316940527-4d1c138978a0?q=80&w=3512&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
};

type AdminCreateUserBody = {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  website?: string;
  phone?: string;
  address?: string;
  about?: string;
  gearCategory?: string;
};

type GeocodeResult = {
  lat: number;
  lng: number;
};

const jsonResponse = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getMapboxToken = (): string | null =>
  Deno.env.get("MAPBOX_TOKEN") ??
  Deno.env.get("VITE_MAPBOX_TOKEN") ??
  Deno.env.get("REACT_APP_MAPBOX_TOKEN") ??
  null;

async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  const token = getMapboxToken();
  if (!token || !address.trim()) {
    return null;
  }

  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${token}&limit=1`;
    const response = await fetch(url);
    if (!response.ok) {
      console.warn("Address geocoding request failed:", response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    const center = data?.features?.[0]?.center;
    if (!Array.isArray(center) || center.length < 2) {
      return null;
    }

    const [lng, lat] = center;
    if (typeof lat !== "number" || typeof lng !== "number") {
      return null;
    }

    return { lat, lng };
  } catch (error) {
    console.error("Address geocoding error:", error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    return jsonResponse(500, { error: "Missing required Supabase environment variables" });
  }

  const authorization = req.headers.get("Authorization");
  if (!authorization) {
    return jsonResponse(401, { error: "Unauthorized" });
  }

  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authorization } },
  });
  const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    const { data: authData, error: authError } = await authClient.auth.getUser();
    if (authError || !authData?.user) {
      return jsonResponse(401, { error: "Unauthorized" });
    }

    const { data: isAdmin, error: adminCheckError } = await authClient.rpc("is_admin");
    if (adminCheckError || isAdmin !== true) {
      return jsonResponse(403, { error: "Forbidden" });
    }

    let body: AdminCreateUserBody;
    try {
      body = (await req.json()) as AdminCreateUserBody;
    } catch {
      return jsonResponse(400, { error: "Invalid JSON body" });
    }

    const name = body.name?.trim() ?? "";
    const email = body.email?.trim() ?? "";
    const password = body.password ?? "";
    const displayRole = body.role?.trim() ?? "";
    const website = body.website?.trim() ?? "";
    const phone = body.phone?.trim() ?? "";
    const address = body.address?.trim() ?? "";
    const about = body.about?.trim() ?? "";
    const gearCategory = body.gearCategory?.trim() ?? "";

    if (!name || !email || !password || !displayRole) {
      return jsonResponse(400, { error: "name, email, password, and role are required" });
    }

    if (password.length < 6) {
      return jsonResponse(400, { error: "Password should be at least 6 characters" });
    }

    let locationLat: number | null = null;
    let locationLng: number | null = null;
    if (address) {
      const geocodeResult = await geocodeAddress(address);
      if (geocodeResult) {
        locationLat = geocodeResult.lat;
        locationLng = geocodeResult.lng;
      }
    }

    const { data: createdUserData, error: createUserError } = await adminClient.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true,
    });

    if (createUserError) {
      return jsonResponse(400, { error: createUserError.message });
    }

    const userId = createdUserData.user?.id;
    if (!userId) {
      return jsonResponse(500, { error: "User creation failed - no user data returned" });
    }

    await sleep(1000);

    const categoryImages =
      displayRole === "retail-store" && gearCategory ? categoryAssets[gearCategory] ?? {} : {};

    const { error: profileError } = await adminClient
      .from("profiles")
      .upsert(
        {
          id: userId,
          name,
          website: website || null,
          phone: phone || null,
          address: address || null,
          about: about || null,
          location_lat: locationLat,
          location_lng: locationLng,
          ...categoryImages,
        },
        { onConflict: "id" },
      );

    if (profileError) {
      return jsonResponse(500, { error: `Failed to upsert profile: ${profileError.message}` });
    }

    const dbRole: "admin" | "user" = displayRole === "admin" ? "admin" : "user";
    const rolePayload = {
      role: dbRole,
      display_role: displayRole,
    };

    const { data: existingRoles, error: roleLookupError } = await adminClient
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .limit(1);

    if (roleLookupError) {
      return jsonResponse(500, { error: `Failed to check existing role: ${roleLookupError.message}` });
    }

    if (existingRoles && existingRoles.length > 0) {
      const { error: updateRoleError } = await adminClient
        .from("user_roles")
        .update(rolePayload)
        .eq("id", existingRoles[0].id);

      if (updateRoleError) {
        return jsonResponse(500, { error: `Failed to update role: ${updateRoleError.message}` });
      }
    } else {
      const { error: insertRoleError } = await adminClient.from("user_roles").insert({
        user_id: userId,
        ...rolePayload,
      });

      if (insertRoleError) {
        return jsonResponse(500, { error: `Failed to insert role: ${insertRoleError.message}` });
      }
    }

    return jsonResponse(200, {
      user_id: userId,
      location_geocoded: locationLat !== null && locationLng !== null,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "server error";
    return jsonResponse(500, { error: message });
  }
});
