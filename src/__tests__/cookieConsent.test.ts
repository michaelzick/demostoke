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

describe("cookieConsent", () => {
  beforeEach(() => {
    localStorage.clear();
    clearConsentCookie();
    delete window.__loadAnalytics;
    delete window.gtag;
    vi.restoreAllMocks();
  });

  it("returns null when no consent is stored", () => {
    expect(getStoredConsent()).toBeNull();
    expect(hasAnalyticsConsent()).toBe(false);
  });

  it("round-trips consent through localStorage and the mirror cookie", () => {
    window.__loadAnalytics = vi.fn();
    const state = setConsent(true);

    expect(state).toMatchObject({ version: CONSENT_VERSION, analytics: true });
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
    };
    document.cookie = `${CONSENT_KEY}=${encodeURIComponent(JSON.stringify(state))}; path=/`;

    expect(getStoredConsent()).toEqual(state);
    clearConsentCookie();
  });

  it("loads analytics and replays the suppressed page_view on grant", () => {
    const loadAnalytics = vi.fn();
    window.__loadAnalytics = loadAnalytics;
    window.dataLayer = [];

    setConsent(true);

    expect(loadAnalytics).toHaveBeenCalledTimes(1);
    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({ event: "page_view" }),
    );
  });

  it("mutes trackers, expires cookies, and reloads on revoke after grant", () => {
    window.__loadAnalytics = vi.fn();
    setConsent(true);

    const gtag = vi.fn();
    window.gtag = gtag;
    const setOptOut = vi.fn();
    (window as Window & { amplitude?: unknown }).amplitude = {
      track: vi.fn(),
      setOptOut,
    };
    document.cookie = "_ga=GA1.1.1; path=/";
    const reload = vi.spyOn(pageReloader, "reload").mockImplementation(() => {});

    setConsent(false);

    expect(gtag).toHaveBeenCalledWith("consent", "update", {
      analytics_storage: "denied",
    });
    expect(setOptOut).toHaveBeenCalledWith(true);
    expect(document.cookie).not.toContain("_ga=");
    expect(reload).toHaveBeenCalledTimes(1);
    expect(hasAnalyticsConsent()).toBe(false);
  });

  it("does not reload when rejecting with no prior grant", () => {
    const reload = vi.spyOn(pageReloader, "reload").mockImplementation(() => {});

    setConsent(false);

    expect(reload).not.toHaveBeenCalled();
    expect(getStoredConsent()).toMatchObject({ analytics: false });
  });

  it("detects the Global Privacy Control signal", () => {
    expect(isGpcEnabled()).toBe(false);
    Object.defineProperty(navigator, "globalPrivacyControl", {
      value: true,
      configurable: true,
    });
    expect(isGpcEnabled()).toBe(true);
    Object.defineProperty(navigator, "globalPrivacyControl", {
      value: undefined,
      configurable: true,
    });
  });

  it("notifies consent subscribers and supports unsubscribe", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToConsent(listener);

    setConsent(false);
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ analytics: false }),
    );

    unsubscribe();
    setConsent(false);
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
