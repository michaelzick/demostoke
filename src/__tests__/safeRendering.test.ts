import fs from "node:fs";
import vm from "node:vm";
import { describe, expect, it, vi } from "vitest";
import {
  createPopupContent,
  createUserLocationPopupContent,
} from "@/utils/mapUtils";

vi.mock("mapbox-gl", () => ({ default: {} }));

// Execute the actual SSR injection helpers without starting the HTTP server.
const source = fs.readFileSync("server/index.js", "utf8");
const helpers = vm.runInNewContext(
  source.slice(
    source.indexOf("const escapeContent ="),
    source.indexOf("const applyHeadMetadata ="),
  ) +
    ";({ upsertStructuredData, injectSsrPageData, upsertTitle, upsertMetaByName })",
  { PUBLIC_SITE_URL: "https://www.demostoke.com" },
);
const payload =
  '</script><script id=attack>void 0</script> $& $` $\' <img src=x onerror="void 0">';

describe("safe SSR metadata", () => {
  it("keeps hostile schema values parseable without adding executable elements", () => {
    const html = helpers.upsertStructuredData(
      '<html><head><script id="structured-data" type="application/ld+json">\n{}\n</script></head></html>',
      { name: payload },
    );
    const doc = new DOMParser().parseFromString(html, "text/html");
    expect(doc.querySelectorAll("script")).toHaveLength(1);
    expect(doc.querySelector("#attack, img")).toBeNull();
    expect(JSON.parse(doc.querySelector("#structured-data")!.textContent!))
      .toEqual({ name: payload });
  });

  it("preserves replacement tokens in hydration data and text metadata", () => {
    const shell =
      '<html><head><title>Old</title><meta name="description" content="Old"></head><body></body></html>';
    const html = helpers.injectSsrPageData(
      helpers.upsertMetaByName(
        helpers.upsertTitle(shell, payload),
        "description",
        payload,
      ),
      { name: payload },
    );
    const doc = new DOMParser().parseFromString(html, "text/html");
    expect(doc.title).toBe(payload);
    expect(
      doc.querySelector('meta[name="description"]')!.getAttribute("content"),
    ).toBe(payload);
    expect(doc.querySelectorAll("script")).toHaveLength(1);
    const context = { window: {} as { __SSR_PAGE_DATA__?: unknown } };
    vm.runInNewContext(doc.querySelector("script")!.textContent!, context);
    expect(context.window.__SSR_PAGE_DATA__).toEqual({ name: payload });
  });
});

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
