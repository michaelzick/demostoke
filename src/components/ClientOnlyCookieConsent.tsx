import { useEffect, useState } from "react";
import CookieConsentBanner from "@/components/CookieConsentBanner";

export function ClientOnlyCookieConsent() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <CookieConsentBanner />;
}
