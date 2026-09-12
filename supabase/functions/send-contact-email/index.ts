import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { errorResponse, HttpError, readJson } from "../_shared/http.ts";
import { contactRequest, validate } from "../_shared/requestValidation.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const escapeHtml = (value: string): string => value.replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[char]!));

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { firstName, lastName, email, subject, message, captchaToken } = validate(contactRequest, await readJson(req));
    const recaptchaSecret = Deno.env.get("GOOGLE_RECAPTCHA_SECRET_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!recaptchaSecret || !resendApiKey) throw new Error("Contact configuration unavailable");

    const captchaResponse = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      signal: AbortSignal.timeout(10_000),
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: recaptchaSecret, response: captchaToken }),
    });
    if (!captchaResponse.ok) throw new HttpError(502, "Unable to verify captcha. Please try again.");
    const captchaResult = await captchaResponse.json();
    if (captchaResult.success !== true) throw new HttpError(400, "Captcha verification failed. Please complete it again.");

    const resend = new Resend(resendApiKey);
    const emailResponse = await resend.emails.send({
      from: "DemoStoke Contact Form <noreply@info.demostoke.com>",
      to: ["mzick@zickonezero.com"],
      subject,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${escapeHtml(firstName)} ${escapeHtml(lastName)} (${escapeHtml(email)})</p>
        <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
        <div><strong>Message:</strong><p>${escapeHtml(message).replace(/\r?\n/g, "<br>")}</p></div>
        <hr><p><em>This message was sent via the DemoStoke contact form.</em></p>
      `,
      reply_to: email,
    });
    if (emailResponse.error || !emailResponse.data?.id) {
      throw new HttpError(502, "Failed to send message. Please try again.");
    }
    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    return errorResponse(error, corsHeaders);
  }
};

serve(handler);
