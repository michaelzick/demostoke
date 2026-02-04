import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SearchResult {
  url: string;
  thumbnail: string;
  title: string;
  source: string;
  width?: number;
  height?: number;
}

interface GoogleSearchResponse {
  results: SearchResult[];
}

// Validate that an image URL is accessible
async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        Accept: "image/*",
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return false;
    }

    const contentType = response.headers.get("content-type");
    return contentType ? contentType.startsWith("image/") : false;
  } catch (error) {
    console.log(`URL validation failed for ${url}:`, error);
    return false;
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { equipment_id, equipment_name, category } = await req.json();

    console.log(
      `Auto-assign images triggered for equipment: ${equipment_name} (${equipment_id})`
    );

    if (!equipment_id || !equipment_name) {
      console.error("Missing required fields: equipment_id or equipment_name");
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create Supabase client with service role for DB operations
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if images already exist for this equipment
    const { count: existingCount, error: countError } = await supabase
      .from("equipment_images")
      .select("*", { count: "exact", head: true })
      .eq("equipment_id", equipment_id);

    if (countError) {
      console.error("Error checking existing images:", countError);
      return new Response(
        JSON.stringify({ error: "Failed to check existing images" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (existingCount && existingCount > 0) {
      console.log(
        `Equipment ${equipment_id} already has ${existingCount} images, skipping`
      );
      return new Response(
        JSON.stringify({
          message: "Equipment already has images",
          existingCount,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Build search query
    const searchQuery = `${equipment_name} ${category || ""} product`.trim();
    console.log(`Searching Google Images for: "${searchQuery}"`);

    // Call the google-image-search edge function
    const googleSearchUrl = `${supabaseUrl}/functions/v1/google-image-search`;
    const searchResponse = await fetch(googleSearchUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({
        query: searchQuery,
        count: 30, // Request more to have enough candidates after filtering
        size: "large",
      }),
    });

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error("Google Image Search failed:", errorText);
      return new Response(
        JSON.stringify({ error: "Image search failed", details: errorText }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const searchData: GoogleSearchResponse = await searchResponse.json();
    const searchResults = searchData.results || [];

    console.log(`Got ${searchResults.length} search results`);

    // Filter for HTTPS and minimum dimensions (1000x1000)
    const filteredResults = searchResults.filter((img) => {
      // Must be HTTPS
      if (!img.url.startsWith("https://")) {
        return false;
      }

      // Must have dimensions reported and be at least 1000x1000
      if (!img.width || !img.height) {
        return false;
      }

      if (img.width < 1000 || img.height < 1000) {
        return false;
      }

      return true;
    });

    console.log(
      `${filteredResults.length} images pass HTTPS and dimension filters`
    );

    // Validate URLs and collect up to 3 valid images
    const validImages: SearchResult[] = [];

    for (const img of filteredResults) {
      if (validImages.length >= 3) {
        break;
      }

      const isValid = await validateImageUrl(img.url);
      if (isValid) {
        validImages.push(img);
        console.log(`Valid image found: ${img.url}`);
      }
    }

    if (validImages.length === 0) {
      console.warn(
        `No valid images found for equipment ${equipment_id} (${equipment_name})`
      );

      // Log this event for tracking
      await supabase.rpc("log_security_event", {
        action_type: "auto_image_no_results",
        table_name: "equipment",
        record_id: equipment_id,
        new_values: { equipment_name, category, search_query: searchQuery },
      });

      return new Response(
        JSON.stringify({
          message: "No valid images found",
          searched: searchResults.length,
          filtered: filteredResults.length,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Insert images into equipment_images table
    const imagesToInsert = validImages.map((img, index) => ({
      equipment_id,
      image_url: img.url,
      display_order: index,
      is_primary: index === 0,
    }));

    const { data: insertedImages, error: insertError } = await supabase
      .from("equipment_images")
      .insert(imagesToInsert)
      .select();

    if (insertError) {
      console.error("Error inserting images:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to insert images", details: insertError }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(
      `Successfully assigned ${insertedImages?.length || 0} images to equipment ${equipment_id}`
    );

    // Log success event
    await supabase.rpc("log_security_event", {
      action_type: "auto_image_assigned",
      table_name: "equipment_images",
      record_id: equipment_id,
      new_values: {
        equipment_name,
        images_assigned: insertedImages?.length || 0,
        image_urls: validImages.map((img) => img.url),
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        imagesAssigned: insertedImages?.length || 0,
        images: insertedImages,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Unexpected error in auto-assign-gear-images:", error);
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
