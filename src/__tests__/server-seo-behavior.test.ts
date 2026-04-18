/// <reference types="node" />
import { beforeAll, describe, expect, it } from "vitest";
import { EventEmitter } from "node:events";
import httpMocks from "node-mocks-http";

let app: Awaited<typeof import("../../server/index.js")>["app"];

const get = async (pathname: string) => {
  const req = httpMocks.createRequest({
    method: "GET",
    url: pathname,
    originalUrl: pathname,
    headers: {
      host: "127.0.0.1:4173",
      "x-forwarded-proto": "http",
    },
  });
  const res = httpMocks.createResponse({
    eventEmitter: EventEmitter,
  });

  await new Promise<void>((resolve, reject) => {
    res.on("end", resolve);
    res.on("finish", resolve);
    app.handle(req, res, (error: Error | undefined) => {
      if (error) {
        reject(error);
        return;
      }

      if (!res.writableEnded) {
        resolve();
      }
    });
  });

  return {
    status: res.statusCode,
    headers: res._getHeaders(),
    redirectUrl: typeof res._getRedirectUrl === "function" ? res._getRedirectUrl() : undefined,
    text: res._getData() as string,
  };
};

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  ({ app } = await import("../../server/index.js"));
}, 30000);

describe("SEO server behavior", () => {
  it("returns a real 404 for unknown routes", async () => {
    const response = await get("/does-not-exist");

    expect(response.status).toBe(404);
    expect(response.text).toContain("Page Not Found");
    expect(response.text).toContain('content="noindex,follow"');
  });

  it("redirects legacy demo event URLs to the canonical route", async () => {
    const legacyEvent = await get("/event/example-slug");
    const legacyDemoEvents = await get("/demo-events/example-slug");

    expect(legacyEvent.status).toBe(301);
    expect(legacyEvent.redirectUrl).toBe("http://127.0.0.1:4173/demo-calendar/event/example-slug");
    expect(legacyDemoEvents.status).toBe(301);
    expect(legacyDemoEvents.redirectUrl).toBe("http://127.0.0.1:4173/demo-calendar/event/example-slug");
  });

  it("renders canonical faceted search pages as noindex with a base canonical", async () => {
    const response = await get("/search?q=powder");

    expect(response.status).toBe(200);
    expect(response.text).toContain('content="noindex,follow"');
    expect(response.text).toContain('<link rel="canonical" href="https://www.demostoke.com/search" />');
  });

  it("renders canonical faceted explore pages as noindex with a base canonical", async () => {
    const response = await get("/explore?category=surfboards");

    expect(response.status).toBe(200);
    expect(response.text).toContain('content="noindex,follow"');
    expect(response.text).toContain('<link rel="canonical" href="https://www.demostoke.com/explore" />');
  });

  it("marks the utility gear search route as noindex in both head and headers", async () => {
    const response = await get("/api/gear/search");

    expect(response.status).toBe(200);
    expect(response.headers["x-robots-tag"]).toBe("noindex,follow");
    expect(response.text).toContain('content="noindex,follow"');
    expect(response.text).not.toContain('<link rel="canonical" href="https://www.demostoke.com/api/gear/search" />');
  });

  it("renders crawlable base copy for the public search and explore hubs", async () => {
    const searchPage = await get("/search");
    const explorePage = await get("/explore");

    expect(searchPage.text).toContain(
      "Search DemoStoke by model name, sport, city, or riding style to find gear that is actually available from local shops and riders.",
    );
    expect(explorePage.text).toContain(
      "Browse surfboards, snowboards, skis, and mountain bikes that are available for demo or rental on DemoStoke.",
    );
  });

  it("renders crawlable base copy on the search page even with a query", async () => {
    const response = await get("/search?q=snowboard");

    expect(response.text).toContain(
      "Search DemoStoke by model name, sport, city, or riding style to find gear that is actually available from local shops and riders.",
    );
  });

  it("allows GA4 collection endpoints in the SSR CSP header", async () => {
    const response = await get("/explore");
    const csp = String(response.headers["content-security-policy"] ?? "");

    expect(csp).toContain("connect-src");
    expect(csp).toContain("https://www.google.com");
    expect(csp).toContain("https://www.google-analytics.com");
    expect(csp).toContain("https://*.google-analytics.com");
  });

  it("renders canonical demo event 404s without the loading skeleton shell", async () => {
    const response = await get("/demo-calendar/event/non-existent-demo-event");

    expect(response.status).toBe(404);
    expect(response.text).toContain("Demo event not found");
    expect(response.text).not.toContain("aspect-[16/9]");
  });
});
