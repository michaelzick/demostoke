import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SENDGRID_API_KEY = Deno.env.get("FLEETOPS_SENDGRID_API_KEY")!;
const FROM_EMAIL = Deno.env.get("FLEETOPS_FROM_EMAIL") || "bookings@demostoke.com";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Only allow https image URLs into the src attribute; reject anything else so
// untrusted equipment data cannot break out of the attribute or load
// javascript:/data: payloads.
function safeImageSrc(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function buildEmailHtml(booking: any, equipment: any, shop: any): string {
  const confirmationNumber = booking.id.slice(0, 8).toUpperCase();
  const imageSrc = safeImageSrc(equipment.image_url);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 560px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; }
    .header { background: #2563eb; color: #fff; padding: 24px; text-align: center; }
    .content { padding: 24px; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; font-size: 14px; }
    .total-row { font-weight: bold; font-size: 16px; border-top: 2px solid #333; padding-top: 12px; margin-top: 8px; }
    .footer { padding: 16px 24px; background: #f9fafb; text-align: center; font-size: 12px; color: #888; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin:0;font-size:20px;">Booking Confirmed!</h1>
      <p style="margin:8px 0 0;opacity:0.9;font-size:14px;">${escapeHtml(shop.name)}</p>
    </div>
    <div class="content">
      <p style="font-size:14px;color:#666;">Hi ${escapeHtml(booking.customer_name)},</p>
      <p style="font-size:14px;color:#666;">Your gear rental reservation has been confirmed. Here are your booking details:</p>

      <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:16px 0;">
        <p style="margin:0 0 4px;font-size:12px;color:#888;">Confirmation #</p>
        <p style="margin:0;font-size:18px;font-weight:bold;font-family:monospace;">${confirmationNumber}</p>
      </div>

      ${imageSrc ? `<img src="${escapeHtml(imageSrc)}" alt="${escapeHtml(equipment.name)}" style="width:100%;height:200px;object-fit:cover;border-radius:8px;margin-bottom:16px;">` : ""}

      <h3 style="font-size:16px;margin:0 0 12px;">${escapeHtml(equipment.name)}</h3>

      <div class="detail-row">
        <span style="color:#666;">Dates</span>
        <span>${booking.start_date} to ${booking.end_date}</span>
      </div>
      <div class="detail-row">
        <span style="color:#666;">Duration</span>
        <span>${booking.num_days} day${booking.num_days !== 1 ? "s" : ""}</span>
      </div>
      <div class="detail-row">
        <span style="color:#666;">Base rental</span>
        <span>$${Number(booking.base_price).toFixed(2)}</span>
      </div>
      ${Number(booking.add_ons_price) > 0 ? `
      <div class="detail-row">
        <span style="color:#666;">Add-ons</span>
        <span>$${Number(booking.add_ons_price).toFixed(2)}</span>
      </div>` : ""}
      ${Number(booking.service_fee) > 0 ? `
      <div class="detail-row">
        <span style="color:#666;">Service fee</span>
        <span>$${Number(booking.service_fee).toFixed(2)}</span>
      </div>` : ""}
      ${Number(booking.damage_deposit) > 0 ? `
      <div class="detail-row">
        <span style="color:#666;">Damage deposit</span>
        <span>$${Number(booking.damage_deposit).toFixed(2)}</span>
      </div>` : ""}
      <div class="detail-row total-row">
        <span>Total</span>
        <span>$${Number(booking.total_price).toFixed(2)}</span>
      </div>
    </div>
    <div class="footer">
      <p>Questions? Contact ${escapeHtml(shop.contact_email || shop.name)}</p>
      <p>Powered by DemoStoke</p>
    </div>
  </div>
</body>
</html>`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const accessToken = getBearerToken(req.headers.get("Authorization"));
    if (!accessToken) {
      return jsonResponse({ error: "Unauthorized." }, 401);
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return jsonResponse({ error: "Unauthorized." }, 401);
    }

    const { bookingId } = await req.json();
    if (!bookingId) {
      return jsonResponse({ error: "bookingId is required." }, 400);
    }

    const { data: booking, error: bookingError } = await supabase
      .from("fleetops_bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      return jsonResponse({ error: "Booking not found." }, 404);
    }

    const [{ data: shop }, { data: adminRole }] = await Promise.all([
      supabase
        .from("fleetops_shops")
        .select("id, name, contact_email, owner_id")
        .eq("id", booking.shop_id)
        .single(),
      supabase
        .from("fleetops_user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle(),
    ]);

    if (!shop) {
      return jsonResponse({ error: "Shop not found." }, 404);
    }

    const canSend = shop.owner_id === user.id || Boolean(adminRole);
    if (!canSend) {
      return jsonResponse({ error: "Forbidden." }, 403);
    }

    const { data: equipment } = await supabase
      .from("fleetops_equipment")
      .select("*")
      .eq("id", booking.equipment_id)
      .single();

    if (!equipment) {
      return jsonResponse({ error: "Equipment not found." }, 404);
    }

    const emailHtml = buildEmailHtml(booking, equipment, shop);

    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [
          { to: [{ email: booking.customer_email, name: booking.customer_name }] },
        ],
        from: { email: FROM_EMAIL, name: shop.name },
        subject: `Booking Confirmed - ${equipment.name}`,
        content: [{ type: "text/html", value: emailHtml }],
      }),
    });

    if (!response.ok) {
      return jsonResponse(
        { error: "Email delivery failed.", details: await response.text() },
        502
      );
    }

    return jsonResponse({ success: true });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Failed to send email." },
      400
    );
  }
});
