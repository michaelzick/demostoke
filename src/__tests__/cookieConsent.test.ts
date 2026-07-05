import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  CONSENT_KEY,
  CONSENT_VERSION,
  getStoredConsent,
  hasAnalyticsConsent,
  isGpcEnabled,
  openCookiePreferences,
  pageReloader,
  setConsent,
  subscribeToConsent,
  subscribeToPreferencesOpen,
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

describe("cookieConsent", () => {
  beforeEach(() => {
    localStorage.clear();
    clearConsentCookie();
    delete window.__loadAnalytics;
    delete window.gtag;
    setGpc(undefined);
    vi.restoreAllMocks();
  });

  it("defaults to analytics allowed when nothing is stored (opt-out model)", () => {
    expect(getStoredConsent()).toBeNull();
    expect(hasAnalyticsConsent()).toBe(true);
  });

  it("defaults to analytics denied when a GPC signal is present", () => {
    setGpc(true);
    expect(getStoredConsent()).toBeNull();
    expect(hasAnalyticsConsent()).toBe(false);
  });

  it("round-trips consent through localStorage and the mirror cookie", () => {
    window.__loadAnalytics = vi.fn();
    const state = setConsent(true, false);

    expect(state).toMatchObject({
      version: CONSENT_VERSION,
      analytics: true,
      doNotSell: false,
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

  it("treats do-not-sell as overriding the analytics toggle", () => {
    window.__loadAnalytics = vi.fn();
    vi.spyOn(pageReloader, "reload").mockImplementation(() => {});
    setConsent(true, true);
    expect(hasAnalyticsConsent()).toBe(false);
  });

  it("loads analytics and replays the suppressed page_view when opting back in", () => {
    const reload = vi.spyOn(pageReloader, "reload").mockImplementation(() => {});
    setConsent(false, true);
    expect(reload).toHaveBeenCalledTimes(1);

    const loadAnalytics = vi.fn();
    window.__loadAnalytics = loadAnalytics;
    window.dataLayer = [];

    setConsent(true, false);

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
    setConsent(true, false);

    expect(loadAnalytics).toHaveBeenCalledTimes(1);
    expect(window.dataLayer).not.toContainEqual(
      expect.objectContaining({ event: "page_view" }),
    );
  });

  it("mutes trackers, expires cookies, and reloads on opt-out from the default-on state", () => {
    const gtag = vi.fn();
    window.gtag = gtag;
    const setOptOut = vi.fn();
    (window as Window & { amplitude?: unknown }).amplitude = {
      track: vi.fn(),
      setOptOut,
    };
    document.cookie = "_ga=GA1.1.1; path=/";
    const reload = vi.spyOn(pageReloader, "reload").mockImplementation(() => {});

    setConsent(false, true);

    expect(gtag).toHaveBeenCalledWith("consent", "update", {
      analytics_storage: "denied",
    });
    expect(setOptOut).toHaveBeenCalledWith(true);
    expect(document.cookie).not.toContain("_ga=");
    expect(reload).toHaveBeenCalledTimes(1);
    expect(hasAnalyticsConsent()).toBe(false);
  });

  it("does not reload when opting out while analytics was already off (GPC)", () => {
    setGpc(true);
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
