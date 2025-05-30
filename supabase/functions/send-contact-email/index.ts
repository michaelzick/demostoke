
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
  captchaToken: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Contact email function called with method:", req.method);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    console.log("Request body received:", {
      ...requestBody,
      captchaToken: requestBody.captchaToken ? "***present***" : "missing"
    });

    const { firstName, lastName, email, subject, message, captchaToken }: ContactEmailRequest = requestBody;

    // Check if all required fields are present
    if (!firstName || !lastName || !email || !subject || !message || !captchaToken) {
      console.error("Missing required fields:", {
        firstName: !!firstName,
        lastName: !!lastName,
        email: !!email,
        subject: !!subject,
        message: !!message,
        captchaToken: !!captchaToken
      });
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Verify hCaptcha token
    console.log("Verifying hCaptcha token...");
    const hcaptchaSecret = Deno.env.get("HCAPTCHA_SECRET");
    if (!hcaptchaSecret) {
      console.error("HCAPTCHA_SECRET environment variable not set");
      return new Response(
        JSON.stringify({ error: "Server configuration error - missing captcha secret" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const captchaResponse = await fetch('https://hcaptcha.com/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: hcaptchaSecret,
        response: captchaToken,
      }),
    });

    const captchaResult = await captchaResponse.json();
    console.log("Captcha verification result:", captchaResult);
    
    if (!captchaResult.success) {
      console.error("Captcha verification failed:", captchaResult);
      return new Response(
        JSON.stringify({ error: "Captcha verification failed" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check if Resend API key is configured
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY environment variable not set");
      return new Response(
        JSON.stringify({ error: "Server configuration error - missing email API key" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Sending email via Resend...");
    // Send email to mzick@zickonezero.com using info.demostoke.com as sender
    const emailResponse = await resend.emails.send({
      from: "DemoStoke Contact Form <noreply@info.demostoke.com>",
      to: ["mzick@zickonezero.com"],
      subject: subject,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${firstName} ${lastName} (${email})</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <div>
          <strong>Message:</strong>
          <p>${message.replace(/\n/g, '<br>')}</p>
        </div>
        <hr>
        <p><em>This message was sent via the DemoStoke contact form.</em></p>
      `,
      replyTo: email,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Internal server error",
        details: error.toString()
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
