
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const jsonResponse = (body: unknown, status: number): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token } = await req.json();

    if (!token || typeof token !== "string") {
      return jsonResponse({ success: false, error: "Missing captcha token." }, 400);
    }

    const recaptchaSecret = Deno.env.get("GOOGLE_RECAPTCHA_SECRET_KEY");
    if (!recaptchaSecret) {
      console.error("GOOGLE_RECAPTCHA_SECRET_KEY environment variable not set");
      return jsonResponse(
        { success: false, error: "Server configuration error - missing captcha secret" },
        500,
      );
    }

    // Bind the verification to the caller's IP when available so a solved
    // token cannot be replayed from a different network.
    const forwardedFor = req.headers.get("x-forwarded-for") ?? "";
    const remoteIp = forwardedFor.split(",")[0]?.trim();

    const verifyParams = new URLSearchParams({
      secret: recaptchaSecret,
      response: token,
    });
    if (remoteIp) {
      verifyParams.set("remoteip", remoteIp);
    }

    const captchaResponse = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: verifyParams,
    });

    const captchaResult = await captchaResponse.json();

    if (!captchaResult.success) {
      console.error("Captcha verification failed:", captchaResult);
      const errorCodes: string[] = captchaResult["error-codes"] ?? [];
      let errorMessage = "Captcha verification failed. Please try again.";
      if (errorCodes.includes("timeout-or-duplicate")) {
        errorMessage = "Captcha expired. Please try again.";
      } else if (
        errorCodes.includes("missing-input-response") ||
        errorCodes.includes("invalid-input-response")
      ) {
        errorMessage = "Invalid captcha response. Please try again.";
      } else if (
        errorCodes.includes("missing-input-secret") ||
        errorCodes.includes("invalid-input-secret") ||
        errorCodes.includes("bad-request")
      ) {
        errorMessage = "Captcha configuration error. Please contact support.";
      }
      return jsonResponse({ success: false, error: errorMessage, errorCodes }, 400);
    }

    return jsonResponse({ success: true }, 200);
  } catch (error) {
    console.error("Error in verify-recaptcha function:", error);
    return jsonResponse(
      {
        success: false,
        error: "Captcha verification failed.",
      },
      500,
    );
  }
};

serve(handler);
