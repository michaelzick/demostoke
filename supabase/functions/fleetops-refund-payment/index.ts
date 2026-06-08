import Stripe from "https://esm.sh/stripe@17?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("FLEETOPS_STRIPE_SECRET_KEY") || Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-12-18.acacia",
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
  Deno.env.get("SERVICE_ROLE_KEY")!;

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

function logInternalError(label: string, error: unknown) {
  if (error instanceof Error) {
    console.error(label, {
      name: error.name,
      message: error.message,
    });
    return;
  }

  console.error(label, error);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    const accessToken = getBearerToken(authHeader);
    if (!accessToken) {
      return jsonResponse({ error: "Missing authorization header." }, 401);
    }

    console.log("[refund] Auth token received, verifying user...");
    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);
    const {
      data,
      error: authError,
    } = await adminClient.auth.getUser(accessToken);
    const user = data.user;

    if (authError || !user) {
      console.error("[refund] Auth failed:", authError?.message);
      return jsonResponse({ error: "Unauthorized." }, 401);
    }

    const { bookingId } = await req.json();
    if (!bookingId) {
      return jsonResponse({ error: "bookingId is required." }, 400);
    }

    console.log("[refund] Fetching booking:", bookingId);
    const { data: booking, error: bookingError } = await adminClient
      .from("fleetops_bookings")
      .select(
        "id, shop_id, status, total_price, stripe_payment_intent_id, stripe_refund_id"
      )
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      console.error("[refund] Booking not found:", bookingError?.message);
      return jsonResponse({ error: "Booking not found." }, 404);
    }

    console.log("[refund] Booking found, status:", booking.status, "PI:", booking.stripe_payment_intent_id);

    const { data: shop, error: shopError } = await adminClient
      .from("fleetops_shops")
      .select("id")
      .eq("id", booking.shop_id)
      .eq("owner_id", user.id)
      .single();

    if (shopError || !shop) {
      console.error("[refund] Shop ownership check failed:", shopError?.message);
      return jsonResponse({ error: "You do not have access to this booking." }, 403);
    }

    if (!booking.stripe_payment_intent_id) {
      return jsonResponse(
        { error: "This booking does not have a Stripe payment to refund." },
        400
      );
    }

    if (booking.status === "refunded" || booking.stripe_refund_id) {
      return jsonResponse({ error: "This booking has already been refunded." }, 409);
    }

    console.log("[refund] Creating Stripe refund for PI:", booking.stripe_payment_intent_id);
    const refund = await stripe.refunds.create({
      payment_intent: booking.stripe_payment_intent_id,
      reason: "requested_by_customer",
      metadata: {
        bookingId: booking.id,
        shopId: booking.shop_id,
      },
    });

    const fullyRefunded =
      refund.amount === Math.round(Number(booking.total_price) * 100) &&
      refund.status !== "failed" &&
      refund.status !== "canceled";

    const nextStatus = fullyRefunded ? "refunded" : booking.status;
    const nextRefundedAt = fullyRefunded ? new Date().toISOString() : null;

    const { error: updateError } = await adminClient
      .from("fleetops_bookings")
      .update({
        status: nextStatus,
        stripe_refund_id: refund.id,
        refunded_at: nextRefundedAt,
        updated_at: new Date().toISOString(),
      })
      .eq("id", booking.id);

    if (updateError) {
      console.error("[refund] Failed to update booking after refund:", updateError);
      return jsonResponse(
        { error: "Refund created in Stripe, but booking update failed." },
        500
      );
    }

    console.log("[refund] Success! Refund:", refund.id, "Status:", refund.status, "Booking status:", nextStatus);
    return jsonResponse({
      refundId: refund.id,
      refundStatus: refund.status,
      bookingStatus: nextStatus,
    });
  } catch (error) {
    logInternalError("[refund] Error", error);
    return jsonResponse(
      { error: "Unable to refund this booking right now." },
      500
    );
  }
});
