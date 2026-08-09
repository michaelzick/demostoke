import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  CONSENT_KEY,
  CONSENT_VERSION,
  getStoredConsent,
  hasAnalyticsConsent,
  isEuVisitor,
  isGpcEnabled,
  openCookiePreferences,
  pageReloader,
  setConsent,
  subscribeToConsent,
  subscribeToPreferencesOpen,
  timeZoneReader,
} from "@/utils/cookieConsent";

const clearConsentCookie = () => {
  document.cookie = `${CONSENT_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
};

const setGpc = (value: boolean | undefined) => {
  Object.defineProperty(navigator, "globalPrivacyControl", {
    value,
    configurable: true,
  });
};

const setTimeZone = (tz: string) =>
  vi.spyOn(timeZoneReader, "get").mockReturnValue(tz);

describe("cookieConsent", () => {
  beforeEach(() => {
    localStorage.clear();
    clearConsentCookie();
    delete window.__loadAnalytics;
    delete window.gtag;
    delete window.mixpanel;
    setGpc(undefined);
    vi.restoreAllMocks();
    // Deterministic non-EU default regardless of the host machine.
    setTimeZone("America/Los_Angeles");
  });

  it("defaults to analytics allowed when nothing is stored (opt-out model)", () => {
    expect(getStoredConsent()).toBeNull();
    expect(hasAnalyticsConsent()).toBe(true);
  });

  it("keeps analytics allowed by default under GPC (GPC covers sale/sharing only)", () => {
    setGpc(true);
    expect(getStoredConsent()).toBeNull();
    expect(hasAnalyticsConsent()).toBe(true);
  });

  it("defaults to analytics denied for EU/EEA/UK timezones (opt-in model)", () => {
    setTimeZone("Europe/Berlin");
    expect(getStoredConsent()).toBeNull();
    expect(hasAnalyticsConsent()).toBe(false);
  });

  it("treats EU Atlantic island timezones as GDPR territory", () => {
    setTimeZone("Atlantic/Canary");
    expect(isEuVisitor()).toBe(true);
    expect(hasAnalyticsConsent()).toBe(false);
  });

  it("detects non-EU timezones as outside GDPR territory", () => {
    expect(isEuVisitor()).toBe(false);
    setTimeZone("Europe/Madrid");
    expect(isEuVisitor()).toBe(true);
  });

  it("round-trips consent through localStorage and the mirror cookie", () => {
    window.__loadAnalytics = vi.fn();
    const state = setConsent(true, true);

    expect(state).toMatchObject({
      version: CONSENT_VERSION,
      analytics: true,
      doNotSell: true,
    });
    expect(getStoredConsent()).toEqual(state);
    expect(JSON.parse(localStorage.getItem(CONSENT_KEY)!)).toEqual(state);
    expect(document.cookie).toContain(CONSENT_KEY);
  });

  it("returns null on version mismatch so the banner re-prompts", () => {
    localStorage.setItem(
      CONSENT_KEY,
      JSON.stringify({
        version: CONSENT_VERSION + 1,
        timestamp: new Date().toISOString(),
        analytics: true,
        doNotSell: false,
      }),
    );
    expect(getStoredConsent()).toBeNull();
  });

  it("returns null on stored values missing doNotSell (v1 shape)", () => {
    localStorage.setItem(
      CONSENT_KEY,
      JSON.stringify({
        version: CONSENT_VERSION,
        timestamp: new Date().toISOString(),
        analytics: true,
      }),
    );
    expect(getStoredConsent()).toBeNull();
  });

  it("returns null on unparseable stored values", () => {
    localStorage.setItem(CONSENT_KEY, "not-json");
    expect(getStoredConsent()).toBeNull();
  });

  it("falls back to the cookie when localStorage is empty", () => {
    const state = {
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
      analytics: true,
      doNotSell: false,
    };
    document.cookie = `${CONSENT_KEY}=${encodeURIComponent(JSON.stringify(state))}; path=/`;

    expect(getStoredConsent()).toEqual(state);
    clearConsentCookie();
  });

  it("does not let do-not-sell disable analytics", () => {
    const loadAnalytics = vi.fn();
    window.__loadAnalytics = loadAnalytics;

    setConsent(true, true);

    expect(hasAnalyticsConsent()).toBe(true);
    expect(loadAnalytics).toHaveBeenCalledTimes(1);
  });

  it("loads analytics and replays the suppressed page_view when opting back in", () => {
    const reload = vi.spyOn(pageReloader, "reload").mockImplementation(() => {});
    setConsent(false, true);
    expect(reload).toHaveBeenCalledTimes(1);

    const loadAnalytics = vi.fn();
    window.__loadAnalytics = loadAnalytics;
    window.dataLayer = [];

    setConsent(true, true);

    expect(loadAnalytics).toHaveBeenCalledTimes(1);
    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({ event: "page_view" }),
    );
  });

  it("does not replay a page_view when analytics was already allowed", () => {
    const loadAnalytics = vi.fn();
    window.__loadAnalytics = loadAnalytics;
    window.dataLayer = [];

    // Nothing stored → analytics already running by default.
    setConsent(true, true);

    expect(loadAnalytics).toHaveBeenCalledTimes(1);
    expect(window.dataLayer).not.toContainEqual(
      expect.objectContaining({ event: "page_view" }),
    );
  });

  it("mutes trackers, expires cookies, and reloads on opt-out from the default-on state", () => {
    const gtag = vi.fn();
    window.gtag = gtag;
    const optOutTracking = vi.fn();
    window.mixpanel = {
      track: vi.fn(),
      opt_out_tracking: optOutTracking,
    } as unknown as Mixpanel;
    document.cookie = "_ga=GA1.1.1; path=/";
    const reload = vi.spyOn(pageReloader, "reload").mockImplementation(() => {});

    setConsent(false, true);

    expect(gtag).toHaveBeenCalledWith("consent", "update", {
      analytics_storage: "denied",
    });
    expect(optOutTracking).toHaveBeenCalledTimes(1);
    expect(document.cookie).not.toContain("_ga=");
    expect(reload).toHaveBeenCalledTimes(1);
    expect(hasAnalyticsConsent()).toBe(false);
  });

  it("clears tracker localStorage keys but preserves consent state on opt-out", () => {
    vi.spyOn(pageReloader, "reload").mockImplementation(() => {});
    localStorage.setItem("mp_bd90c5d017f23977ba6dd6965e4fa8c7_mixpanel", "{}");
    localStorage.setItem("AMP_test", "{}");

    setConsent(false, true);

    expect(
      localStorage.getItem("mp_bd90c5d017f23977ba6dd6965e4fa8c7_mixpanel"),
    ).toBeNull();
    expect(localStorage.getItem("AMP_test")).toBeNull();
    expect(getStoredConsent()).toMatchObject({
      analytics: false,
      doNotSell: true,
    });
  });

  it("does not reload when declining analytics while it was already off (EU default)", () => {
    setTimeZone("Europe/Paris");
    const reload = vi.spyOn(pageReloader, "reload").mockImplementation(() => {});

    setConsent(false, true);

    expect(reload).not.toHaveBeenCalled();
    expect(getStoredConsent()).toMatchObject({
      analytics: false,
      doNotSell: true,
    });
  });

  it("detects the Global Privacy Control signal", () => {
    expect(isGpcEnabled()).toBe(false);
    setGpc(true);
    expect(isGpcEnabled()).toBe(true);
  });

  it("notifies consent subscribers and supports unsubscribe", () => {
    vi.spyOn(pageReloader, "reload").mockImplementation(() => {});
    const listener = vi.fn();
    const unsubscribe = subscribeToConsent(listener);

    setConsent(false, true);
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ analytics: false, doNotSell: true }),
    );

    unsubscribe();
    setConsent(false, true);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("bridges openCookiePreferences to subscribers", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToPreferencesOpen(listener);

    openCookiePreferences();
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    openCookiePreferences();
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
