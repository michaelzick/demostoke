import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { assertSafePublicUrl, fetchPublicResource } from "../_shared/urlSafety.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ImageRecord {
  id: string;
  image_url: string;
  equipment_id: string;
  equipment: {
    id: string;
    name: string;
    category: string;
    user_id: string;
  }[] | null;
}

interface BrokenImage {
  imageId: string;
  imageUrl: string;
  equipmentId: string;
  gearName: string;
  gearSlug: string;
  category: string;
  totalImages: number;
  errorReason: string;
}

// Helper to slugify text (matching frontend logic)
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

type ImageCheck = { status: "working" | "broken" | "inconclusive"; reason: string };

async function testImageUrl(
  url: string,
  throttledHosts: Set<string>,
): Promise<ImageCheck> {
  // Skip internal/relative URLs and Supabase storage URLs (they're managed internally)
  if (url.startsWith("/")) {
    return { status: "working", reason: "" };
  }

  let host: string;
  try {
    const parsed = assertSafePublicUrl(url);
    host = parsed.hostname;
    if (throttledHosts.has(host)) {
      return { status: "inconclusive", reason: "Host rate limited; retry later" };
    }
    const storageHost = new URL(Deno.env.get("SUPABASE_URL")!).hostname;
    if (parsed.hostname === storageHost && parsed.pathname.startsWith("/storage/v1/object/")) {
      return { status: "working", reason: "" };
    }
  } catch {
    return { status: "inconclusive", reason: "URL could not be safely checked" };
  }

  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept":
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.google.com/",
  };

  try {
    const response = await fetchPublicResource(url, { method: "HEAD", headers });

    // If HEAD is successful and returns an image type, we're good
    if (response.ok) {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.startsWith("image/")) {
        return { status: "working", reason: "" };
      }
    }

    // Do not amplify throttling with an immediate GET retry. Other probes to
    // this host stop for this scan; a later scan can retry after recovery.
    if (response.status === 429) {
      throttledHosts.add(host);
      return { status: "inconclusive", reason: "HTTP 429: rate limited; retry later" };
    }
    if (response.status >= 500) {
      return { status: "inconclusive", reason: `HTTP ${response.status}: retry later` };
    }

    // Some CDNs reject HEAD even for valid images. Confirm absence with GET.
    const getResponse = await fetchPublicResource(url, { headers, discardBody: true });
    if (getResponse.status === 429) throttledHosts.add(host);
    if (!getResponse.ok) {
      return {
        status: [404, 410].includes(getResponse.status) ? "broken" : "inconclusive",
        reason: `HTTP ${getResponse.status}`,
      };
    }

    const contentType = getResponse.headers.get("content-type");
    if (!contentType || !contentType.startsWith("image/")) {
      // Challenge pages and transient HTML errors are not proof of a missing image.
      return { status: "inconclusive", reason: "Unexpected content type; review manually" };
    }

    return { status: "working", reason: "" };

  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return { status: "inconclusive", reason: "Timeout; retry later" };
      }
      return { status: "inconclusive", reason: "Connection could not be verified; retry later" };
    }
    return { status: "inconclusive", reason: "Connection could not be verified; retry later" };
  }
}

async function getImageCountForEquipment(
  supabase: SupabaseClient,
  equipmentId: string
): Promise<number> {
  const { count } = await supabase
    .from("equipment_images")
    .select("*", { count: "exact", head: true })
    .eq("equipment_id", equipmentId);

  return count || 0;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Verify user and check admin status
    const token = authHeader.replace("Bearer ", "");
    const { data: authData, error: authError } = await supabase.auth.getUser(token);

    if (authError || !authData?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = authData.user.id;

    const { data: adminRole, error: adminError } = await supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .eq("role", "admin")
      .limit(1)
      .maybeSingle();

    if (adminError || !adminRole) {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Scan the API's bounded page and report its full count separately.
    const { data: images, error: fetchError, count } = await supabase
      .from("equipment_images")
      .select(
        `
        id,
        image_url,
        equipment_id,
        equipment:equipment_id (
          id,
          name,
          category,
          user_id
        )
      `, { count: "exact" }
      )
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Error fetching images:", fetchError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch images" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!images || images.length === 0) {
      return new Response(
        JSON.stringify({
          brokenImages: [],
          inconclusiveImages: [],
          uniqueUrlsChecked: 0,
          total: 0,
          scanned: 0,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const brokenImages: BrokenImage[] = [];
    const inconclusiveImages: BrokenImage[] = [];
    const total = count ?? images.length;
    // Cache promises, including in-flight probes, so shared category images
    // are fetched once rather than once per equipment_images row.
    const checks = new Map<string, Promise<ImageCheck>>();
    const throttledHosts = new Set<string>();
    const imageCounts = new Map<string, Promise<number>>();
    const batchSize = 10; // Process 10 URLs in parallel

    // Process images in batches
    for (let i = 0; i < images.length; i += batchSize) {
      const batch = images.slice(i, i + batchSize) as unknown as ImageRecord[];

      const results = await Promise.all(
        batch.map(async (img) => {
          if (!checks.has(img.image_url)) {
            checks.set(img.image_url, testImageUrl(img.image_url, throttledHosts));
          }
          const testResult = await checks.get(img.image_url)!;

          const equip = Array.isArray(img.equipment) ? img.equipment[0] : img.equipment;

          if (testResult.status !== "working") {
            // Counts are only needed for the rows that can be removed.
            if (equip && testResult.status === "broken" && !imageCounts.has(img.equipment_id)) {
              imageCounts.set(img.equipment_id, getImageCountForEquipment(supabase, img.equipment_id));
            }
            const result: BrokenImage = {
              imageId: img.id,
              imageUrl: img.image_url,
              equipmentId: img.equipment_id,
              gearName: equip?.name ?? "[Orphaned - Equipment Deleted]",
              gearSlug: equip ? `${slugify(equip.name)}--${img.equipment_id}` : "",
              category: equip?.category ?? "Unknown",
              totalImages: await imageCounts.get(img.equipment_id) ?? 0,
              errorReason: testResult.reason,
            };
            if (testResult.status === "inconclusive") {
              inconclusiveImages.push(result);
              return null;
            }
            return result;
          }

          return null;
        })
      );

      brokenImages.push(
        ...results.filter((r): r is BrokenImage => r !== null)
      );
    }

    return new Response(
      JSON.stringify({
        brokenImages,
        inconclusiveImages,
        uniqueUrlsChecked: checks.size,
        total,
        scanned: images.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
