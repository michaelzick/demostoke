import Stripe from "https://esm.sh/stripe@17?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  createWidgetViewer,
  resolveWidgetCheckoutMode,
} from "../_shared/fleetopsWidgetCheckout.ts";

const stripe = new Stripe(Deno.env.get("FLEETOPS_STRIPE_SECRET_KEY") || Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-12-18.acacia",
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const BLOCKING_STATUSES = ["pending", "confirmed"];
const PENDING_HOLD_MINUTES = 30;

const CATEGORY_ALIASES: Record<string, string> = {
  snowboard: "snowboards",
  snowboards: "snowboards",
  ski: "skis",
  skis: "skis",
  surfboard: "surfboards",
  surfboards: "surfboards",
  skateboard: "skateboards",
  skateboards: "skateboards",
  wetsuit: "wetsuits",
  wetsuits: "wetsuits",
  "mountain-bike": "mountain-bikes",
  "mountain-bikes": "mountain-bikes",
  mountainbike: "mountain-bikes",
  mountainbikes: "mountain-bikes",
  mtb: "mountain-bikes",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function normalizeDate(value: unknown, fieldName: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${fieldName} is required.`);
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`${fieldName} must be a valid ISO date.`);
  }

  return parsed.toISOString().slice(0, 10);
}

function normalizeEquipmentCategory(category: unknown): string {
  if (typeof category !== "string") return "";

  const normalized = category
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-");

  if (!normalized) return "";

  return CATEGORY_ALIASES[normalized] ?? normalized;
}

function calculateBookingPrice(params: {
  pricePerDay: number;
  numDays: number;
  addOns: Array<{ price_per_day: number }>;
  damageDeposit?: number | null;
  serviceFeeRate?: number;
}) {
  const {
    pricePerDay,
    numDays,
    addOns,
    damageDeposit = 0,
    serviceFeeRate = 0.1,
  } = params;

  const basePrice = pricePerDay * numDays;
  const addOnsTotal = addOns.reduce(
    (sum, addOn) => sum + addOn.price_per_day * numDays,
    0
  );
  const subtotal = basePrice + addOnsTotal;
  const serviceFee = Math.round(subtotal * serviceFeeRate * 100) / 100;
  const total =
    Math.round((subtotal + serviceFee + Number(damageDeposit || 0)) * 100) / 100;

  return {
    numDays,
    basePrice: Math.round(basePrice * 100) / 100,
    addOnsTotal: Math.round(addOnsTotal * 100) / 100,
    serviceFee,
    damageDeposit: Math.round(Number(damageDeposit || 0) * 100) / 100,
    total,
  };
}

function isPendingBookingActive(booking: {
  status: string;
  created_at?: string | null;
}) {
  if (booking.status !== "pending") {
    return booking.status === "confirmed";
  }

  if (!booking.created_at) {
    return false;
  }

  const createdAt = new Date(booking.created_at);
  if (Number.isNaN(createdAt.getTime())) {
    return false;
  }

  return Date.now() - createdAt.getTime() < PENDING_HOLD_MINUTES * 60 * 1000;
}

async function resolveCallerRoles(authHeader: string | null) {
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
    const body = await req.json();
    const shopId =
      typeof body.shopId === "string" && body.shopId.trim()
        ? body.shopId.trim()
        : "";
    const equipmentId =
      typeof body.equipmentId === "string" && body.equipmentId.trim()
        ? body.equipmentId.trim()
        : "";
    const customerName =
      typeof body.customerName === "string" && body.customerName.trim()
        ? body.customerName.trim()
        : "";
    const customerEmail =
      typeof body.customerEmail === "string" && body.customerEmail.trim()
        ? body.customerEmail.trim()
        : "";
    const customerPhone =
      typeof body.customerPhone === "string" && body.customerPhone.trim()
        ? body.customerPhone.trim()
        : null;
    const addOnIds = Array.isArray(body.addOnIds)
      ? [...new Set(body.addOnIds.filter((value) => typeof value === "string"))]
      : [];

    if (!shopId || !equipmentId) {
      return jsonResponse({ error: "shopId and equipmentId are required." }, 400);
    }

    if (!customerName || !customerEmail) {
      return jsonResponse(
        { error: "customerName and customerEmail are required." },
        400
      );
    }

    const { data: shop, error: shopError } = await supabase
      .from("fleetops_shops")
      .select("id, widget_config")
      .eq("id", shopId)
      .single();

    if (shopError || !shop) {
      return jsonResponse({ error: "Shop not found." }, 404);
    }

    const callerRoles = await resolveCallerRoles(
      req.headers.get("Authorization")
    );
    const viewer = createWidgetViewer(
      resolveWidgetCheckoutMode(shop.widget_config),
      callerRoles
    );

    if (viewer.checkoutMode === "admin_only" && !viewer.isAdmin) {
      return jsonResponse(
        {
          error:
            "Checkout is only available to authenticated admin users for this shop.",
        },
        403
      );
    }

    if (viewer.checkoutMode !== "admin_only" && viewer.isGuest) {
      return jsonResponse({ error: "Booking is not available in guest mode." }, 403);
    }

    const startDate = normalizeDate(body.startDate, "startDate");
    const endDate = normalizeDate(body.endDate, "endDate");

    if (startDate > endDate) {
      return jsonResponse(
        { error: "startDate must be before or equal to endDate." },
        400
      );
    }

    const start = new Date(`${startDate}T00:00:00.000Z`);
    const end = new Date(`${endDate}T00:00:00.000Z`);
    const numDays =
      Math.floor((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1;

    if (numDays < 1) {
      return jsonResponse({ error: "Booking must be at least one day." }, 400);
    }

    const { data: equipment, error: equipmentError } = await supabase
      .from("fleetops_equipment")
      .select(
        "id, shop_id, name, category, visible, status, price_per_day, damage_deposit"
      )
      .eq("id", equipmentId)
      .eq("shop_id", shopId)
      .single();

    if (equipmentError || !equipment) {
      return jsonResponse({ error: "Equipment not found." }, 404);
    }

    if (!equipment.visible || equipment.status !== "available") {
      return jsonResponse(
        { error: "This item is not currently available for booking." },
        409
      );
    }

    const { data: overlappingBookings, error: overlapError } = await supabase
      .from("fleetops_bookings")
      .select("id, status, created_at")
      .eq("equipment_id", equipmentId)
      .eq("shop_id", shopId)
      .in("status", BLOCKING_STATUSES)
      .lte("start_date", endDate)
      .gte("end_date", startDate);

    if (overlapError) {
      return jsonResponse(
        { error: "Unable to validate availability right now." },
        500
      );
    }

    if ((overlappingBookings ?? []).some(isPendingBookingActive)) {
      return jsonResponse(
        { error: "This item is no longer available for the selected dates." },
        409
      );
    }

    const normalizedAddOns = addOnIds.length
      ? await supabase
          .from("fleetops_add_ons")
          .select("id, name, category, image_url, price_per_day, shop_id")
          .eq("shop_id", shopId)
          .in("id", addOnIds)
      : { data: [], error: null };

    if (normalizedAddOns.error) {
      return jsonResponse(
        { error: "Unable to load add-ons for this booking." },
        500
      );
    }

    const addOns = normalizedAddOns.data ?? [];
    if (addOns.length !== addOnIds.length) {
      return jsonResponse({ error: "One or more selected add-ons are invalid." }, 400);
    }

    const compatibleCategory = normalizeEquipmentCategory(equipment.category);
    if (
      compatibleCategory &&
      addOns.some(
        (addOn) =>
          normalizeEquipmentCategory(addOn.category) !== compatibleCategory
      )
    ) {
      return jsonResponse(
        { error: "One or more selected add-ons are incompatible with this item." },
        400
      );
    }

    const quote = calculateBookingPrice({
      pricePerDay: Number(equipment.price_per_day ?? 0),
      numDays,
      addOns,
      damageDeposit: equipment.damage_deposit,
    });

    const bookingId = crypto.randomUUID();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(quote.total * 100),
      currency: "usd",
      receipt_email: customerEmail,
      metadata: {
        bookingId,
        shopId,
        equipmentId,
        startDate,
        endDate,
      },
    });

    const { error: bookingError } = await supabase.from("fleetops_bookings").insert({
      id: bookingId,
      shop_id: shopId,
      equipment_id: equipmentId,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      start_date: startDate,
      end_date: endDate,
      num_days: quote.numDays,
      base_price: quote.basePrice,
      add_ons_price: quote.addOnsTotal,
      damage_deposit: quote.damageDeposit,
      service_fee: quote.serviceFee,
      total_price: quote.total,
      status: "pending",
      stripe_payment_intent_id: paymentIntent.id,
      add_ons_snapshot: addOns.map((addOn) => ({
        id: addOn.id,
        shop_id: addOn.shop_id,
        name: addOn.name,
        category: addOn.category,
        image_url: addOn.image_url,
        price_per_day: Number(addOn.price_per_day ?? 0),
      })),
    });

    if (bookingError) {
      await stripe.paymentIntents.cancel(paymentIntent.id).catch(() => null);
      return jsonResponse(
        { error: "Unable to create the booking draft right now." },
        500
      );
    }

    return jsonResponse({
      bookingId,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      quote,
    });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Payment setup failed." },
      400
    );
  }
});
