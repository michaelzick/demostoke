
import { useEffect, useImperativeHandle, useRef, useState, forwardRef } from "react";

export const RECAPTCHA_SITE_KEY = "6LcYhBYtAAAAAGYVjeKg7VfdkPqZ4raTDLInlBnn";

export interface RecaptchaHandle {
  /** Runs the invisible challenge and resolves with a fresh single-use token. */
  execute: () => Promise<string>;
  reset: () => void;
}

interface RecaptchaProps {
  siteKey?: string;
  /**
   * Hides the floating Google badge. Google permits this only when the host
   * form shows the reCAPTCHA disclosure text instead (see RecaptchaDisclosure).
   */
  hideBadge?: boolean;
}

declare global {
  interface Window {
    grecaptcha?: {
      render: (container: HTMLElement, params: Record<string, unknown>) => number;
      execute: (widgetId: number) => void;
      reset: (widgetId: number) => void;
    };
    onloadRecaptchaCallback?: () => void;
  }
}

const SCRIPT_SRC = "https://www.google.com/recaptcha/api.js?onload=onloadRecaptchaCallback&render=explicit";

const Recaptcha = forwardRef<RecaptchaHandle, RecaptchaProps>(({ siteKey = RECAPTCHA_SITE_KEY, hideBadge = false }, ref) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<number | null>(null);
  const pendingRef = useRef<{ resolve: (token: string) => void; reject: (error: Error) => void } | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Load the reCAPTCHA script once
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.grecaptcha?.render) {
      setLoaded(true);
      return;
    }

    if (!document.querySelector('script[src*="google.com/recaptcha/api.js"]')) {
      window.onloadRecaptchaCallback = () => {
        setLoaded(true);
      };

      const script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
      return;
    }

    // Script tag exists but the API isn't ready yet (another instance is
    // loading it); poll until grecaptcha is available.
    const interval = window.setInterval(() => {
      if (window.grecaptcha?.render) {
        window.clearInterval(interval);
        setLoaded(true);
      }
    }, 100);
    return () => window.clearInterval(interval);
  }, []);

  // Render one invisible widget per component instance
  useEffect(() => {
    if (!loaded || widgetIdRef.current !== null || !containerRef.current || !window.grecaptcha) return;

    try {
      widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
        sitekey: siteKey,
        size: "invisible",
        callback: (token: string) => {
          pendingRef.current?.resolve(token);
          pendingRef.current = null;
        },
        "expired-callback": () => {
          pendingRef.current?.reject(new Error("Captcha expired. Please try again."));
          pendingRef.current = null;
        },
        "error-callback": () => {
          console.error("reCAPTCHA error");
          pendingRef.current?.reject(new Error("Captcha error. Please try again."));
          pendingRef.current = null;
        },
      });
    } catch (error) {
      console.error("reCAPTCHA rendering error:", error);
    }
  }, [loaded, siteKey]);

  useImperativeHandle(ref, () => ({
    execute: () =>
      new Promise<string>((resolve, reject) => {
        if (typeof window === "undefined" || !window.grecaptcha || widgetIdRef.current === null) {
          reject(new Error("Captcha is still loading. Please try again."));
          return;
        }
        // Tokens are single-use; always start from a clean widget state
        window.grecaptcha.reset(widgetIdRef.current);
        pendingRef.current = { resolve, reject };
        window.grecaptcha.execute(widgetIdRef.current);
      }),
    reset: () => {
      if (typeof window !== "undefined" && window.grecaptcha && widgetIdRef.current !== null) {
        window.grecaptcha.reset(widgetIdRef.current);
      }
      pendingRef.current = null;
    },
  }), []);

  // Invisible mode: the badge renders bottom-right automatically. The badge
  // element is created inside this container, so a scoped class can hide it.
  return <div ref={containerRef} className={hideBadge ? "recaptcha-badge-hidden" : undefined} />;
});

Recaptcha.displayName = "Recaptcha";

/**
 * Google's required disclosure for forms that hide the reCAPTCHA badge:
 * https://developers.google.com/recaptcha/docs/faq#id-like-to-hide-the-recaptcha-badge.-what-is-allowed
 */
export const RecaptchaDisclosure = ({ className = "" }: { className?: string }) => (
  <p className={`text-center text-xs leading-5 text-muted-foreground ${className}`.trim()}>
    This site is protected by reCAPTCHA and the Google{" "}
    <a
      href="https://policies.google.com/privacy"
      target="_blank"
      rel="noreferrer"
      className="underline underline-offset-2 hover:text-foreground"
    >
      Privacy Policy
    </a>{" "}
    and{" "}
    <a
      href="https://policies.google.com/terms"
      target="_blank"
      rel="noreferrer"
      className="underline underline-offset-2 hover:text-foreground"
    >
      Terms of Service
    </a>{" "}
    apply.
  </p>
);

export default Recaptcha;
