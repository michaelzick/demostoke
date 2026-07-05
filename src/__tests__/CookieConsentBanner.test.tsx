import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import {
  CONSENT_KEY,
  CONSENT_VERSION,
  openCookiePreferences,
} from "@/utils/cookieConsent";

const renderBanner = () =>
  render(
    <MemoryRouter>
      <CookieConsentBanner />
    </MemoryRouter>,
  );

const storeConsent = (analytics: boolean) => {
  localStorage.setItem(
    CONSENT_KEY,
    JSON.stringify({
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
      analytics,
    }),
  );
};

describe("CookieConsentBanner", () => {
  beforeEach(() => {
    localStorage.clear();
    document.cookie = `${CONSENT_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    delete window.__loadAnalytics;
    vi.restoreAllMocks();
  });

  it("shows the banner when no consent is stored", () => {
    renderBanner();
    expect(
      screen.getByRole("dialog", { name: "Cookie consent" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Accept All" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reject All" })).toBeInTheDocument();
  });

  it("stays hidden when consent is already stored", () => {
    storeConsent(true);
    renderBanner();
    expect(
      screen.queryByRole("dialog", { name: "Cookie consent" }),
    ).not.toBeInTheDocument();
  });

  it("stores analytics consent and loads analytics on Accept All", () => {
    const loadAnalytics = vi.fn();
    window.__loadAnalytics = loadAnalytics;
    renderBanner();

    fireEvent.click(screen.getByRole("button", { name: "Accept All" }));

    expect(JSON.parse(localStorage.getItem(CONSENT_KEY)!)).toMatchObject({
      version: CONSENT_VERSION,
      analytics: true,
    });
    expect(loadAnalytics).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByRole("dialog", { name: "Cookie consent" }),
    ).not.toBeInTheDocument();
  });

  it("stores rejection on Reject All", () => {
    renderBanner();

    fireEvent.click(screen.getByRole("button", { name: "Reject All" }));

    expect(JSON.parse(localStorage.getItem(CONSENT_KEY)!)).toMatchObject({
      analytics: false,
    });
    expect(
      screen.queryByRole("dialog", { name: "Cookie consent" }),
    ).not.toBeInTheDocument();
  });

  it("opens preferences with essential locked on and analytics off by default", () => {
    renderBanner();

    fireEvent.click(screen.getByRole("button", { name: "Manage Preferences" }));

    const essential = screen.getByRole("switch", {
      name: "Essential cookies (always on)",
    });
    expect(essential).toBeChecked();
    expect(essential).toBeDisabled();

    const analytics = screen.getByRole("switch", { name: "Analytics cookies" });
    expect(analytics).not.toBeChecked();
    expect(analytics).toBeEnabled();
  });

  it("saves the analytics toggle from the preferences dialog", () => {
    const loadAnalytics = vi.fn();
    window.__loadAnalytics = loadAnalytics;
    renderBanner();

    fireEvent.click(screen.getByRole("button", { name: "Manage Preferences" }));
    fireEvent.click(screen.getByRole("switch", { name: "Analytics cookies" }));
    fireEvent.click(screen.getByRole("button", { name: "Save Preferences" }));

    expect(JSON.parse(localStorage.getItem(CONSENT_KEY)!)).toMatchObject({
      analytics: true,
    });
    expect(loadAnalytics).toHaveBeenCalledTimes(1);
  });

  it("shows GPC copy when a Global Privacy Control signal is present", () => {
    Object.defineProperty(navigator, "globalPrivacyControl", {
      value: true,
      configurable: true,
    });
    renderBanner();

    fireEvent.click(screen.getByRole("button", { name: "Manage Preferences" }));
    expect(
      screen.getByText(/We detected a Global Privacy Control signal/i),
    ).toBeInTheDocument();

    Object.defineProperty(navigator, "globalPrivacyControl", {
      value: undefined,
      configurable: true,
    });
  });

  it("opens the preferences dialog via openCookiePreferences with the banner hidden", () => {
    storeConsent(false);
    renderBanner();
    expect(
      screen.queryByRole("dialog", { name: "Cookie consent" }),
    ).not.toBeInTheDocument();

    act(() => {
      openCookiePreferences();
    });

    expect(screen.getByText("Cookie Preferences")).toBeInTheDocument();
    expect(
      screen.getByRole("switch", { name: "Analytics cookies" }),
    ).not.toBeChecked();
  });
});
