import { beforeEach, describe, expect, it, vi } from "vitest";
import { identifyUser, resetAnalyticsIdentity } from "@/utils/tracking";
import { CONSENT_KEY, timeZoneReader } from "@/utils/cookieConsent";

const setTimeZone = (tz: string) =>
  vi.spyOn(timeZoneReader, "get").mockReturnValue(tz);

describe("tracking identity helpers", () => {
  beforeEach(() => {
    localStorage.clear();
    document.cookie = `${CONSENT_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    delete window.mixpanel;
    vi.restoreAllMocks();
    // Deterministic non-EU default (opt-out model → consent allowed).
    setTimeZone("America/Los_Angeles");
  });

  it("identifies with the user id when consent allows and mixpanel is loaded", () => {
    const identify = vi.fn();
    window.mixpanel = { identify } as unknown as Mixpanel;

    identifyUser("00000000-0000-4000-8000-000000000000");

    expect(identify).toHaveBeenCalledWith(
      "00000000-0000-4000-8000-000000000000",
    );
    expect(identify).toHaveBeenCalledTimes(1);
  });

  it("no-ops without analytics consent (EU opt-in default)", () => {
    setTimeZone("Europe/Berlin");
    const identify = vi.fn();
    window.mixpanel = { identify } as unknown as Mixpanel;

    identifyUser("user-id");

    expect(identify).not.toHaveBeenCalled();
  });

  it("no-ops when window.mixpanel is absent", () => {
    expect(() => identifyUser("user-id")).not.toThrow();
  });

  it("resets identity when mixpanel is loaded and never throws when absent", () => {
    const reset = vi.fn();
    window.mixpanel = { reset } as unknown as Mixpanel;
    resetAnalyticsIdentity();
    expect(reset).toHaveBeenCalledTimes(1);

    delete window.mixpanel;
    expect(() => resetAnalyticsIdentity()).not.toThrow();
  });
});
