import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  createWidgetViewer,
  resolveWidgetCheckoutMode,
} from "../_shared/fleetopsWidgetCheckout.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const BLOCKING_BOOKING_STATUSES = ["pending", "confirmed"];
const PENDING_HOLD_MINUTES = 30;

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function parseDateParam(value: string | null, fieldName: string): Date | null {
  if (!value) return null;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(
      `Invalid ${fieldName}. Use an ISO date or datetime, e.g. 2026-03-04 or 2026-03-04T10:00:00Z`
    );
  }

  return parsed;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function compareDateStrings(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

function overlaps(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  return compareDateStrings(startA, endB) <= 0 &&
    compareDateStrings(endA, startB) >= 0;
}

function plusOneDay(dateString: string): string {
  const next = new Date(`${dateString}T00:00:00.000Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  return toDateString(next);
}

function isPendingBookingActive(createdAt: string | null | undefined) {
  if (!createdAt) return false;

  const parsed = new Date(createdAt);
  if (Number.isNaN(parsed.getTime())) return false;

  return Date.now() - parsed.getTime() < PENDING_HOLD_MINUTES * 60 * 1000;
}

function isBlockingBooking(booking: {
  status: string;
  created_at?: string | null;
}) {
  if (booking.status === "confirmed") return true;
  if (booking.status !== "pending") return false;
  return isPendingBookingActive(booking.created_at);
}

function computeNextAvailableDate(
  bookings: Array<{ start_date: string; end_date: string }>,
  referenceDate: string
): string | null {
  if (!bookings.length) return null;

  const sorted = [...bookings].sort((a, b) =>
    compareDateStrings(a.start_date, b.start_date)
  );

  let cursor = referenceDate;
  let wasBlocked = false;

  for (const booking of sorted) {
    if (compareDateStrings(booking.end_date, cursor) < 0) continue;

    if (compareDateStrings(booking.start_date, cursor) > 0) {
      // Found a gap where the item is available.
      return wasBlocked ? cursor : null;
    }

    // booking.start_date <= cursor <= booking.end_date
    wasBlocked = true;
    cursor = plusOneDay(booking.end_date);
  }

  return wasBlocked ? cursor : null;
}

function safeJson(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? value as Record<string, unknown>
    : {};
}

function parseCoordinate(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeLocation(value: unknown) {
  const location = safeJson(value);
  const address =
    typeof location.address === "string" ? location.address.trim() : "";
  const lat = parseCoordinate(location.lat);
  const lng = parseCoordinate(location.lng);
  const hasPlaceholderCoordinates = lat === 0 && lng === 0 && address.length > 0;
  const normalizedLat =
    lat !== null && lng !== null && !hasPlaceholderCoordinates ? lat : null;
  const normalizedLng =
    lat !== null && lng !== null && !hasPlaceholderCoordinates ? lng : null;

  if (!address && normalizedLat === null && normalizedLng === null) {
    return null;
  }

  return {
    lat: normalizedLat,
    lng: normalizedLng,
    address,
  };
}

function resolveLocation(primary: unknown, fallback: unknown) {
  const primaryLocation = normalizeLocation(primary);
  const fallbackLocation = normalizeLocation(fallback);

  if (!primaryLocation && !fallbackLocation) {
    return {
      lat: null,
      lng: null,
      address: "",
    };
  }

  return {
    lat: primaryLocation?.lat ?? fallbackLocation?.lat ?? null,
    lng: primaryLocation?.lng ?? fallbackLocation?.lng ?? null,
    address: primaryLocation?.address || fallbackLocation?.address || "",
  };
}

function toOrigin(value: string | null | undefined): string {
  if (!value) return "";

  try {
    return new URL(value).origin;
  } catch {
    return "";
  }
}

function toPublicImageUrl(value: unknown, publicOrigin: string): string {
  if (typeof value !== "string") return "";

  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) return trimmed;

  try {
    return new URL(trimmed).toString();
  } catch {
    if (!publicOrigin) return trimmed;

    if (trimmed.startsWith("/")) {
      return `${publicOrigin}${trimmed}`;
    }

    const cleaned = trimmed.replace(/^\.?\/*/, "");
    return cleaned ? `${publicOrigin}/${cleaned}` : "";
  }
}

function parsePublicStoragePath(value: string, baseOrigin: string) {
  const targetUrl = new URL(value, baseOrigin);
  const segments = targetUrl.pathname.split("/").filter(Boolean);

  if (
    segments.length < 6 ||
    segments[0] !== "storage" ||
    segments[1] !== "v1" ||
    segments[2] !== "object" ||
    segments[3] !== "public"
  ) {
    throw new Error("Only public storage object URLs can be proxied.");
  }

  const bucket = segments[4];
  const objectPath = segments.slice(5).join("/");

  if (!bucket || !objectPath) {
    throw new Error("Invalid public storage object path.");
  }

  return { bucket, objectPath };
}

async function resolveCallerRoles(
  supabase: ReturnType<typeof createClient>,
  authHeader: string | null
) {
  if (!authHeader) return [];

  const jwt = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!jwt) return [];

  const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
  if (userError || !user) return [];

  const { data: roleRows, error: roleError } = await supabase
    .from("fleetops_user_roles")
    .select("role")
    .eq("user_id", user.id);

  if (roleError || !roleRows) return [];

  return [...new Set(roleRows.map((row) => row.role).filter(Boolean))];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "GET" && req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed." }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRole =
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
      Deno.env.get("SUPABASE_ANON_KEY");
    const publicSupabaseOrigin =
      toOrigin(Deno.env.get("FLEETOPS_PUBLIC_SUPABASE_URL")) ||
      toOrigin(req.url) ||
      toOrigin(supabaseUrl);

    if (!supabaseUrl || !supabaseServiceRole) {
      throw new Error("Supabase environment variables are not configured.");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRole);

    const url = new URL(req.url);
    const proxyImageUrl = url.searchParams.get("proxy_image_url")?.trim();
    if (proxyImageUrl) {
      const { bucket, objectPath } = parsePublicStoragePath(
        proxyImageUrl,
        url.origin,
      );
      const { data: fileData, error: downloadError } = await supabase.storage
        .from(bucket)
        .download(objectPath);

      if (downloadError || !fileData) {
        return new Response(
          JSON.stringify({
            error: `Unable to proxy image: ${downloadError?.message || "file not found"}.`,
          }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      return new Response(fileData.stream(), {
        headers: {
          ...corsHeaders,
          "Content-Type": fileData.type || "application/octet-stream",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    const requestBody =
      req.method === "POST"
        ? await req.json().catch(() => ({}))
        : {};

    const shopSlug = (
      url.searchParams.get("shop") ||
      url.searchParams.get("shop_slug") ||
      (typeof requestBody.shopSlug === "string" ? requestBody.shopSlug : "") ||
      (typeof requestBody.shop === "string" ? requestBody.shop : "") ||
      ""
    ).trim();

    if (!shopSlug) {
      return new Response(
        JSON.stringify({
          error: "Missing required query parameter: shop (shop slug).",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const requestedStart = parseDateParam(
      url.searchParams.get("start") ??
        (typeof requestBody.start === "string" ? requestBody.start : null) ??
        (typeof requestBody.startDate === "string"
          ? requestBody.startDate
          : null),
      "start"
    );
    const requestedEnd = parseDateParam(
      url.searchParams.get("end") ??
        (typeof requestBody.end === "string" ? requestBody.end : null) ??
        (typeof requestBody.endDate === "string" ? requestBody.endDate : null),
      "end"
    );

    if ((requestedStart && !requestedEnd) || (!requestedStart && requestedEnd)) {
      return new Response(
        JSON.stringify({
          error:
            "Both start and end must be provided together for date/time availability filtering.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (
      requestedStart &&
      requestedEnd &&
      requestedStart.getTime() > requestedEnd.getTime()
    ) {
      return new Response(
        JSON.stringify({
          error: "start must be before or equal to end.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: shop, error: shopError } = await supabase
      .from("fleetops_shops")
      .select(
        "id, slug, name, description, logo_url, location, widget_config"
      )
      .eq("slug", shopSlug)
      .single();

    if (shopError || !shop) {
      return new Response(
        JSON.stringify({
          error: `Shop not found for slug "${shopSlug}".`,
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const callerRoles = await resolveCallerRoles(
      supabase,
      req.headers.get("Authorization")
    );
    const viewer = createWidgetViewer(
      resolveWidgetCheckoutMode(shop.widget_config),
      callerRoles
    );

    let equipmentQuery = supabase
      .from("fleetops_equipment")
      .select(
        "id, shop_id, name, category, subcategory, description, price_per_day, price_per_hour, price_per_week, damage_deposit, image_url, rating, review_count, status, is_featured, visible, location, specifications, availability, created_at, updated_at, equipment_images:fleetops_equipment_images(image_url, display_order), pricing_options:fleetops_pricing_options(id, duration, price)"
      )
      .eq("shop_id", shop.id);

    equipmentQuery = equipmentQuery.eq("visible", true);

    const { data: equipmentRows, error: equipmentError } = await equipmentQuery
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false });

    if (equipmentError) throw equipmentError;

    const equipment = equipmentRows ?? [];
    const equipmentIds = equipment.map((row) => row.id);

    const now = new Date();
    const today = toDateString(now);
    const requestedStartDate = requestedStart
      ? toDateString(requestedStart)
      : today;
    const requestedEndDate = requestedEnd ? toDateString(requestedEnd) : today;

    const availabilityWindowStart = requestedStartDate;
    // Always fetch a forward horizon so nextAvailableDate can be computed
    // correctly even when there are back-to-back bookings beyond requested_end.
    const availabilityWindowEnd = toDateString(
      addDays(requestedStart ?? now, 365)
    );

    let bookingsByEquipment = new Map<
      string,
      Array<{
        id: string;
        equipment_id: string;
        start_date: string;
        end_date: string;
        status: string;
      }>
    >();

    if (equipmentIds.length > 0) {
      const { data: bookings, error: bookingsError } = await supabase
        .from("fleetops_bookings")
        .select("id, equipment_id, start_date, end_date, status, created_at")
        .eq("shop_id", shop.id)
        .in("equipment_id", equipmentIds)
        .in("status", BLOCKING_BOOKING_STATUSES)
        .lte("start_date", availabilityWindowEnd)
        .gte("end_date", availabilityWindowStart)
        .order("start_date", { ascending: true });

      if (bookingsError) throw bookingsError;

      bookingsByEquipment = (bookings ?? [])
        .filter((booking) => isBlockingBooking(booking))
        .reduce((acc, booking) => {
        const existing = acc.get(booking.equipment_id) ?? [];
        existing.push(booking);
        acc.set(booking.equipment_id, existing);
        return acc;
      }, new Map());
    }

    const { data: addOnRows, error: addOnError } = await supabase
      .from("fleetops_add_ons")
      .select("id, shop_id, name, category, image_url, price_per_day")
      .eq("shop_id", shop.id)
      .order("category")
      .order("name");

    if (addOnError) throw addOnError;

    const gear = equipment.map((row) => {
      const primaryImage = toPublicImageUrl(row.image_url, publicSupabaseOrigin);
      const normalizedImageList = Array.isArray(row.equipment_images)
        ? [...row.equipment_images]
            .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
            .map((img) => toPublicImageUrl(img.image_url, publicSupabaseOrigin))
            .filter((url) => !!url)
        : [];
      const images =
        normalizedImageList.length > 0
          ? normalizedImageList
          : primaryImage
          ? [primaryImage]
          : [];

      const pricingOptions = Array.isArray(row.pricing_options)
        ? row.pricing_options.map((opt) => ({
            id: opt.id,
            duration: opt.duration,
            price: Number(opt.price ?? 0),
          }))
        : [];

      const bookings = bookingsByEquipment.get(row.id) ?? [];

      const hasRequestedConflict = bookings.some((booking) =>
        overlaps(
          booking.start_date,
          booking.end_date,
          requestedStartDate,
          requestedEndDate
        )
      );

      const nextAvailableDate = computeNextAvailableDate(
        bookings,
        requestedStartDate
      );

      const normalizedAvailability = safeJson(row.availability);
      const location = resolveLocation(row.location, shop.location);
      const specs = safeJson(row.specifications);
      const availableByStatus = row.status === "available";
      const available = availableByStatus && !hasRequestedConflict;

      return {
        id: row.id,
        shop_id: row.shop_id,
        name: row.name,
        category: row.category,
        subcategory: row.subcategory,
        description: row.description ?? "",
        image_url: images[0] ?? primaryImage,
        images,
        price_per_day: Number(row.price_per_day ?? 0),
        price_per_hour:
          row.price_per_hour !== null && row.price_per_hour !== undefined
            ? Number(row.price_per_hour)
            : null,
        price_per_week:
          row.price_per_week !== null && row.price_per_week !== undefined
            ? Number(row.price_per_week)
            : null,
        damage_deposit:
          row.damage_deposit !== null && row.damage_deposit !== undefined
            ? Number(row.damage_deposit)
            : null,
        rating: Number(row.rating ?? 0),
        review_count: Number(row.review_count ?? 0),
        status: row.status ?? "available",
        is_featured: !!row.is_featured,
        visible: !!row.visible,
        visible_on_map: !!row.visible,
        created_at: row.created_at,
        updated_at: row.updated_at,
        distance: null,
        location,
        specifications: {
          size: String(specs.size ?? ""),
          weight: String(specs.weight ?? ""),
          material: String(specs.material ?? ""),
          suitable: String(specs.suitable ?? ""),
          details: String(specs.details ?? ""),
          booking_story: String(
            specs.booking_story ?? specs.bookingStory ?? ""
          ),
        },
        pricing_options: pricingOptions,
        owner: {
          id: shop.id,
          name: shop.name,
          slug: shop.slug,
          logo_url: shop.logo_url ?? null,
          imageUrl: shop.logo_url ?? null,
          rating: 0,
          reviewCount: 0,
          responseRate: 0,
          shopId: shop.id,
          partyId: null,
        },
        availability: {
          available,
          available_by_status: availableByStatus,
          has_requested_conflict: hasRequestedConflict,
          nextAvailableDate:
            normalizedAvailability.nextAvailableDate ??
            normalizedAvailability.next_available_date ??
            nextAvailableDate,
          next_available_date:
            normalizedAvailability.nextAvailableDate ??
            normalizedAvailability.next_available_date ??
            nextAvailableDate,
          requested_start: requestedStartDate,
          requested_end: requestedEndDate,
        },
        booked_ranges: bookings.map((booking) => ({
          booking_id: booking.id,
          status: booking.status,
          start_date: booking.start_date,
          end_date: booking.end_date,
          start_at: `${booking.start_date}T00:00:00.000Z`,
          end_at: `${booking.end_date}T23:59:59.999Z`,
          all_day: true,
        })),
      };
    });

    return new Response(
      JSON.stringify({
        fetched_at: new Date().toISOString(),
        shop: {
          id: shop.id,
          slug: shop.slug,
          name: shop.name,
          description: shop.description,
          logo_url: shop.logo_url,
          location: normalizeLocation(shop.location),
          widget_config: safeJson(shop.widget_config),
        },
        viewer,
        filters: {
          requested_start: requestedStartDate,
          requested_end: requestedEndDate,
          availability_window_start: availabilityWindowStart,
          availability_window_end: availabilityWindowEnd,
          include_hidden: false,
        },
        add_ons: (addOnRows ?? []).map((row) => ({
          id: row.id,
          shop_id: row.shop_id,
          name: row.name,
          category: row.category,
          image_url: row.image_url,
          price_per_day: Number(row.price_per_day ?? 0),
        })),
        total: gear.length,
        gear,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error?.message ?? "Failed to load shop gear feed.",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
