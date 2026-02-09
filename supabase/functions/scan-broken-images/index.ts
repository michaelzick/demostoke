// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

interface ScanProgress {
  current: number;
  total: number;
  brokenImages: BrokenImage[];
}

async function testImageUrl(
  url: string
): Promise<{ broken: boolean; reason: string; }> {
  // Skip internal/relative URLs and Supabase storage URLs (they're managed internally)
  if (url.startsWith("/")) {
    return { broken: false, reason: "" };
  }

  // Skip Supabase storage URLs - they're reliable
  if (url.includes("supabase.co/storage")) {
    return { broken: false, reason: "" };
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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // Increased timeout to 8s

    // Try HEAD first
    const response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      headers: headers,
      redirect: "follow",
    });

    clearTimeout(timeoutId);

    // If HEAD is successful and returns an image type, we're good
    if (response.ok) {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.startsWith("image/")) {
        return { broken: false, reason: "" };
      }
    }

    // If HEAD failed (404, 403, 405) OR content-type wasn't image, try GET
    // Many CDNs block HEAD or strictly require GET for images
    // Also handles the case where HEAD returns 404 but GET returns 200 (rare but happens with some dynamic image handlers)

    // Only retry if it wasn't a timeout

    const getController = new AbortController();
    const getTimeoutId = setTimeout(() => getController.abort(), 10000); // 10s for GET

    const getResponse = await fetch(url, {
      method: "GET",
      signal: getController.signal,
      headers: {
        ...headers,
        // Range header can sometimes trigger different behavior, but for images strict checking removing it might be safer to mimic browser
        // "Range": "bytes=0-0",
      },
    });

    clearTimeout(getTimeoutId);

    if (!getResponse.ok) {
      // If 403/401, it might just be protected, but technically accessible to some.
      // But for a public site, 403 usually means broken/forbidden.
      // 404 is definitely broken.
      return { broken: true, reason: `HTTP ${getResponse.status}` };
    }

    const contentType = getResponse.headers.get("content-type");
    if (!contentType || !contentType.startsWith("image/")) {
      // If it got 200 OK but not an image, it's likely a soft 404 or a generic error page
      return { broken: true, reason: "Not an image" };
    }

    return { broken: false, reason: "" };

  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return { broken: true, reason: "Timeout" };
      }
      return { broken: true, reason: error.message || "Connection failed" };
    }
    return { broken: true, reason: "Connection failed" };
  }
}

async function getImageCountForEquipment(
  supabase: any,
  equipmentId: string
): Promise<number> {
  const { count } = await supabase
    .from("equipment_images")
    .select("*", { count: "exact", head: true })
    .eq("equipment_id", equipmentId);

  return count || 0;
}

// @ts-ignore
Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    // @ts-ignore
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      // @ts-ignore
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create Supabase client
    // @ts-ignore
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    // @ts-ignore
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user and check admin status
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } =
      await supabase.auth.getClaims(token);

    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;

    // Check if user is admin using the is_admin RPC
    const { data: isAdmin, error: adminError } = await supabase.rpc(
      "is_admin",
      { user_id: userId }
    );

    if (adminError || !isAdmin) {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Fetch all equipment_images with joined equipment data
    const { data: images, error: fetchError } = await supabase
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
      `
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
          total: 0,
          scanned: 0,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const brokenImages: BrokenImage[] = [];
    const total = images.length;
    const batchSize = 10; // Process 10 URLs in parallel

    // Process images in batches
    for (let i = 0; i < images.length; i += batchSize) {
      const batch = images.slice(i, i + batchSize) as unknown as ImageRecord[];

      const results = await Promise.all(
        batch.map(async (img) => {
          const testResult = await testImageUrl(img.image_url);

          const equip = Array.isArray(img.equipment) ? img.equipment[0] : img.equipment;

          if (testResult.broken && equip) {
            const totalImages = await getImageCountForEquipment(
              supabase,
              img.equipment_id
            );

            return {
              imageId: img.id,
              imageUrl: img.image_url,
              equipmentId: img.equipment_id,
              gearName: equip.name,
              gearSlug: slugify(equip.name),
              category: equip.category,
              totalImages,
              errorReason: testResult.reason,
            } as BrokenImage;
          }

          // Handle orphaned images (equipment deleted but image remains)
          if (testResult.broken && !equip) {
            return {
              imageId: img.id,
              imageUrl: img.image_url,
              equipmentId: img.equipment_id,
              gearName: "[Orphaned - Equipment Deleted]",
              gearSlug: "",
              category: "Unknown",
              totalImages: 0,
              errorReason: testResult.reason,
            } as BrokenImage;
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
        total,
        scanned: total,
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
