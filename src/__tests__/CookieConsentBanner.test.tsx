import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import {
  CONSENT_KEY,
  CONSENT_VERSION,
  openCookiePreferences,
  pageReloader,
  timeZoneReader,
} from "@/utils/cookieConsent";

const renderBanner = () =>
  render(
    <MemoryRouter>
      <CookieConsentBanner />
    </MemoryRouter>,
  );

const storeConsent = (analytics: boolean, doNotSell: boolean) => {
  localStorage.setItem(
    CONSENT_KEY,
    JSON.stringify({
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
      analytics,
      doNotSell,
    }),
  );
};

const setGpc = (value: boolean | undefined) => {
  Object.defineProperty(navigator, "globalPrivacyControl", {
    value,
    configurable: true,
  });
};

const setTimeZone = (tz: string) =>
  vi.spyOn(timeZoneReader, "get").mockReturnValue(tz);

describe("CookieConsentBanner", () => {
  beforeEach(() => {
    localStorage.clear();
    document.cookie = `${CONSENT_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    delete window.__loadAnalytics;
    setGpc(undefined);
    vi.restoreAllMocks();
    vi.spyOn(pageReloader, "reload").mockImplementation(() => {});
    // Deterministic non-EU default regardless of the host machine.
    setTimeZone("America/Los_Angeles");
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
    storeConsent(true, true);
    renderBanner();
    expect(
      screen.queryByRole("dialog", { name: "Cookie consent" }),
    ).not.toBeInTheDocument();
  });

  it("stores analytics on and keeps do-not-sell on with Accept All", () => {
    const loadAnalytics = vi.fn();
    window.__loadAnalytics = loadAnalytics;
    renderBanner();

    fireEvent.click(screen.getByRole("button", { name: "Accept All" }));

    expect(JSON.parse(localStorage.getItem(CONSENT_KEY)!)).toMatchObject({
      version: CONSENT_VERSION,
      analytics: true,
      doNotSell: true,
    });
    expect(loadAnalytics).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByRole("dialog", { name: "Cookie consent" }),
    ).not.toBeInTheDocument();
  });

  it("stores rejection with do-not-sell on Reject All", () => {
    renderBanner();

    fireEvent.click(screen.getByRole("button", { name: "Reject All" }));

    expect(JSON.parse(localStorage.getItem(CONSENT_KEY)!)).toMatchObject({
      analytics: false,
      doNotSell: true,
    });
    expect(
      screen.queryByRole("dialog", { name: "Cookie consent" }),
    ).not.toBeInTheDocument();
  });

  it("opens preferences with analytics on and do-not-sell on by default", () => {
    renderBanner();

    fireEvent.click(screen.getByRole("button", { name: "Manage Preferences" }));

    const essential = screen.getByRole("switch", {
      name: "Essential cookies (always on)",
    });
    expect(essential).toBeChecked();
    expect(essential).toBeDisabled();

    expect(screen.getByRole("switch", { name: "Analytics cookies" })).toBeChecked();
    expect(
      screen.getByRole("switch", { name: "Do not sell or share my information" }),
    ).toBeChecked();
  });

  it("keeps analytics on by default under GPC and shows the honor copy", () => {
    setGpc(true);
    renderBanner();

    fireEvent.click(screen.getByRole("button", { name: "Manage Preferences" }));

    expect(
      screen.getByRole("switch", { name: "Analytics cookies" }),
    ).toBeChecked();
    expect(
      screen.getByRole("switch", { name: "Do not sell or share my information" }),
    ).toBeChecked();
    expect(
      screen.getByText(/We detected a Global Privacy Control signal/i),
    ).toBeInTheDocument();
  });

  it("defaults analytics off for EU/EEA/UK visitors and shows the opt-in copy", () => {
    setTimeZone("Europe/Berlin");
    renderBanner();

    fireEvent.click(screen.getByRole("button", { name: "Manage Preferences" }));

    expect(
      screen.getByRole("switch", { name: "Analytics cookies" }),
    ).not.toBeChecked();
    expect(
      screen.getByRole("switch", { name: "Do not sell or share my information" }),
    ).toBeChecked();
    expect(
      screen.getByText(/visiting from the EU\/EEA\/UK/i),
    ).toBeInTheDocument();
  });

  it("keeps the toggles independent: neither changes the other", () => {
    renderBanner();
    fireEvent.click(screen.getByRole("button", { name: "Manage Preferences" }));

    const analytics = screen.getByRole("switch", { name: "Analytics cookies" });
    const doNotSell = screen.getByRole("switch", {
      name: "Do not sell or share my information",
    });

    fireEvent.click(doNotSell);
    expect(doNotSell).not.toBeChecked();
    expect(analytics).toBeChecked();

    fireEvent.click(analytics);
    expect(analytics).not.toBeChecked();
    expect(doNotSell).not.toBeChecked();
  });

  it("saves independent toggle choices from the preferences dialog", () => {
    const loadAnalytics = vi.fn();
    window.__loadAnalytics = loadAnalytics;
    renderBanner();

    fireEvent.click(screen.getByRole("button", { name: "Manage Preferences" }));
    fireEvent.click(
      screen.getByRole("switch", { name: "Do not sell or share my information" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Save Preferences" }));

    expect(JSON.parse(localStorage.getItem(CONSENT_KEY)!)).toMatchObject({
      analytics: true,
      doNotSell: false,
    });
  });

  it("opens the preferences dialog via openCookiePreferences with the banner hidden", () => {
    storeConsent(false, true);
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
    expect(
      screen.getByRole("switch", { name: "Do not sell or share my information" }),
    ).toBeChecked();
  });
});
