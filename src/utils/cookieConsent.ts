import { safeGet, safeSet, safeSetCookie } from "@/theme/storage";

// The consent bootstrap IIFE in index.html duplicates CONSENT_KEY and
// CONSENT_VERSION so it can gate analytics before any bundle loads.
// Keep the literals there in sync with these constants.
export const CONSENT_KEY = "cookie-consent";
export const CONSENT_VERSION = 2;

export interface ConsentState {
  version: number;
  timestamp: string;
  analytics: boolean;
  doNotSell: boolean;
}

declare global {
  interface Window {
    __loadAnalytics?: () => void;
    gtag?: (...args: unknown[]) => void;
  }
}

type ConsentListener = (state: ConsentState) => void;
type OpenListener = () => void;

const consentListeners = new Set<ConsentListener>();
const preferencesOpenListeners = new Set<OpenListener>();

// Indirection so tests can stub the reload; jsdom's location.reload is
// non-configurable and cannot be spied on directly.
export const pageReloader = {
  reload: () => window.location.reload(),
};

const safeGetCookie = (key: string): string | null => {
  try {
    const match = document.cookie.match("(?:^|; )" + key + "=([^;]*)");
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
};

export const getStoredConsent = (): ConsentState | null => {
  const raw = safeGet(CONSENT_KEY) ?? safeGetCookie(CONSENT_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<ConsentState> | null;
    if (
      parsed &&
      parsed.version === CONSENT_VERSION &&
      typeof parsed.analytics === "boolean" &&
      typeof parsed.doNotSell === "boolean"
    ) {
      return parsed as ConsentState;
    }
    return null;
  } catch {
    return null;
  }
};

export const isGpcEnabled = (): boolean => {
  try {
    return (
      (navigator as Navigator & { globalPrivacyControl?: boolean })
        .globalPrivacyControl === true
    );
  } catch {
    return false;
  }
};

// Indirection so tests can stub the timezone; Intl.DateTimeFormat cannot
// be reliably spied on across environments.
export const timeZoneReader = {
  get: () => Intl.DateTimeFormat().resolvedOptions().timeZone,
};

const EU_ATLANTIC_ZONES = [
  "Atlantic/Canary",
  "Atlantic/Madeira",
  "Atlantic/Azores",
  "Atlantic/Reykjavik",
  "Atlantic/Faroe",
];

// Free timezone heuristic for GDPR territories (EU/EEA/UK/CH) — no network
// request or IP lookup, so it can run before any consent decision. It is
// deliberately over-inclusive: every Europe/* zone counts, plus the
// Atlantic islands used by Spain, Portugal, Iceland, and Denmark. The
// index.html consent bootstrap duplicates this check — keep them in sync.
export const isEuVisitor = (): boolean => {
  try {
    const tz = timeZoneReader.get();
    if (!tz) return false;
    return tz.startsWith("Europe/") || EU_ATLANTIC_ZONES.includes(tz);
  } catch {
    return false;
  }
};

// Opt-out model outside GDPR territories: analytics runs by default until
// the visitor opts out. EU/EEA/UK visitors (timezone heuristic) get an
// opt-in model instead — nothing runs until they accept. The do-not-sell
// preference is independent of analytics: we do not sell or share data,
// so it only records the CPRA opt-out and never gates analytics. GPC is a
// sale/sharing signal, so it also does not gate analytics.
export const hasAnalyticsConsent = (): boolean => {
  const stored = getStoredConsent();
  if (stored) {
    return stored.analytics;
  }
  return !isEuVisitor();
};

// Amplitude can rewrite its AMP_* cookie between revocation and the page
// unload, so this also runs on load whenever consent is denied.
export const expireAnalyticsCookies = () => {
  try {
    const names = document.cookie
      .split(";")
      .map((part) => part.split("=")[0].trim())
      .filter((name) => /^(_ga|_gid|_gat|AMP_|amp_)/.test(name));

    const hostname = window.location.hostname;
    const domains = ["", `; domain=${hostname}`, `; domain=.${hostname}`];
    for (const name of names) {
      for (const domain of domains) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain}`;
      }
    }
  } catch {
    // ignore
  }
};

const pushCurrentPageView = () => {
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "page_view",
      page_location: window.location.href,
      page_path:
        window.location.pathname + window.location.search + window.location.hash,
      page_title: document.title,
    });
  } catch {
    // ignore
  }
};

export const setConsent = (
  analytics: boolean,
  doNotSell: boolean,
): ConsentState => {
  // With the opt-out default, analytics may already be running even when
  // nothing is stored yet, so the previous effective state matters more
  // than the previous stored state.
  const wasAllowed = hasAnalyticsConsent();
  const state: ConsentState = {
    version: CONSENT_VERSION,
    timestamp: new Date().toISOString(),
    analytics,
    doNotSell,
  };
  const serialized = JSON.stringify(state);
  safeSet(CONSENT_KEY, serialized);
  safeSetCookie(CONSENT_KEY, serialized);

  const isAllowed = analytics;
  if (isAllowed) {
    window.__loadAnalytics?.();
    // The page_view for the current page was suppressed if analytics was
    // off when the route rendered.
    if (!wasAllowed) {
      pushCurrentPageView();
    }
  } else if (wasAllowed) {
    window.gtag?.("consent", "update", { analytics_storage: "denied" });
    const amplitude = (
      window as Window & {
        amplitude?: { setOptOut?: (optOut: boolean) => void };
      }
    ).amplitude;
    amplitude?.setOptOut?.(true);
    expireAnalyticsCookies();
    consentListeners.forEach((listener) => listener(state));
    // Reload so already-initialized trackers are fully unloaded.
    pageReloader.reload();
    return state;
  }

  consentListeners.forEach((listener) => listener(state));
  return state;
};

export const subscribeToConsent = (listener: ConsentListener): (() => void) => {
  consentListeners.add(listener);
  return () => consentListeners.delete(listener);
};

export const openCookiePreferences = () => {
  preferencesOpenListeners.forEach((listener) => listener());
};

export const subscribeToPreferencesOpen = (
  listener: OpenListener,
): (() => void) => {
  preferencesOpenListeners.add(listener);
  return () => preferencesOpenListeners.delete(listener);
};
