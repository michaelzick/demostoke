import { describe, expect, it, vi } from "vitest";
import {
  createPopupContent,
  createUserLocationPopupContent,
} from "@/utils/mapUtils";

vi.mock("mapbox-gl", () => ({ default: {} }));

// Execute the actual SSR injection helpers without starting the HTTP server.
const payload =
  '</script><script id=attack>void 0</script> $& $` $\' <img src=x onerror="void 0">';

describe("public map popups", () => {
  it("shows public shop names and addresses literally", () => {
    const address = '123 Main St <img src=x onerror="void 0">';
    const popup = createUserLocationPopupContent({
      id: "shop",
      name: payload,
      address,
      role: "retailer",
    });
    expect(popup.querySelector("h3")!.textContent).toBe(payload);
    expect(popup.textContent).toContain(address);
    expect(popup.querySelector("script, img")).toBeNull();
    expect(popup.querySelector("a")!.getAttribute("href")).toMatch(
      /^\/user-profile\//,
    );
    expect(popup.querySelector("a")!.rel).toBe("noopener noreferrer");
  });

  it("preserves gear, owner, currency and detail navigation without parsing HTML", () => {
    const popup = createPopupContent({
      id: "gear-id",
      name: payload,
      category: "surfboards",
      price_per_day: 250,
      currency_code: "MXN",
      ownerId: "owner",
      ownerName: payload,
    });
    expect(popup.querySelector("h3")!.textContent).toBe(payload);
    expect(popup.querySelector("script, img")).toBeNull();
    expect(popup.querySelectorAll("a")).toHaveLength(2);
    expect(popup.querySelectorAll("a")[0].textContent).toBe(payload);
    expect(popup.querySelectorAll("a")[1].getAttribute("href")).toMatch(
      /^\/gear\/.*--gear-id$/,
    );
    expect(popup.textContent).toContain("250");
  });
});
