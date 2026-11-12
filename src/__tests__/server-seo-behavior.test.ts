/// <reference types="node" />
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
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
  // Warm up the lazy entry-server.js import so the first real test isn't
  // charged for it and pushed past the per-test timeout.
  await get("/");
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

describe("published article server rendering", () => {
  const post = {
    id: "23307d7d-4981-48e7-9589-ce911595db58",
    slug: "article-render-test",
    title: "Published article",
    excerpt: "A real article excerpt.",
    content: '<h2>Article body heading</h2><p>Read the <a href="/gear">gear guide</a>.</p>' +
      '<p onclick="alert(1)"><a href="jav&#x61;script:alert(1)">Unsafe link</a></p>' +
      '</script><script id="unsafe-article-script">alert(1)</script>',
    category: "guides",
    author: "DemoStoke",
    author_id: null,
    published_at: "2026-10-22T00:00:00Z",
    read_time: 5,
    hero_image: null,
    thumbnail: null,
    video_embed: '<iframe src="javascript://www.youtube.com/embed/alert(1)"></iframe>',
    tags: ["gear"],
  };

  const mockBlogLookup = (article = post, available = true) => vi.spyOn(globalThis, "fetch")
    .mockImplementation(async (input) => {
      const url = new URL(String(input));
      expect(url.pathname).toBe("/rest/v1/blog_posts");
      expect(url.searchParams.get("status")).toBe("eq.published");
      if (!available) return Response.json({ message: "Upstream query failed" }, { status: 400 });
      const match = url.searchParams.get("slug") === `eq.${article.slug}` ||
        url.searchParams.get("id") === `eq.${article.id}`;
      return Response.json(match ? [article] : []);
    });

  afterEach(() => vi.restoreAllMocks());

  it("renders the sanitized article inside the initial HTML and safely seeds hydration", async () => {
    const fetch = mockBlogLookup();
    const response = await get(`/blog/${post.slug}`);
    const document = new DOMParser().parseFromString(response.text, "text/html");
    const article = document.querySelector("#root article");

    expect(response.status).toBe(200);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute("href"))
      .toBe(`https://www.demostoke.com/blog/${post.slug}`);
    expect(document.querySelector('meta[property="og:title"]')?.getAttribute("content"))
      .toBe(`${post.title} | DemoStoke`);
    expect(article?.querySelector("h1")?.textContent).toBe(post.title);
    expect(article?.querySelector("h2")?.textContent).toBe("Article body heading");
    expect(article?.querySelector('a[href="/gear"]')?.textContent).toBe("gear guide");
    expect(article?.querySelector("[onclick], a[href^='javascript:'], iframe")).toBeNull();
    expect(document.getElementById("unsafe-article-script")).toBeNull();
    expect(document.getElementById("ssr-page-data")?.textContent).toContain('"slug":"article-render-test"');
  });

  it("uses the current post data for each server request", async () => {
    mockBlogLookup();
    await get(`/blog/${post.slug}`);
    vi.restoreAllMocks();
    mockBlogLookup({ ...post, title: "Edited article title" });
    const response = await get(`/blog/${post.slug}`);
    const document = new DOMParser().parseFromString(response.text, "text/html");

    expect(document.querySelector("#root article h1")?.textContent).toBe("Edited article title");
  });

  it("redirects published UUID links to their canonical slug and keeps the query string", async () => {
    mockBlogLookup();
    const response = await get(`/blog/${post.id}?utm_source=legacy`);

    expect(response.status).toBe(301);
    expect(response.redirectUrl).toBe(`http://127.0.0.1:4173/blog/${post.slug}?utm_source=legacy`);
  });

  it("renders static blog content when no database row matches", async () => {
    mockBlogLookup();
    const response = await get("/blog/surfboard-shapes-explained");
    const document = new DOMParser().parseFromString(response.text, "text/html");

    expect(response.status).toBe(200);
    expect(document.querySelector("#root article h1")?.textContent).toContain("Surfboard Shapes Explained");
  });

  it("renders a missing public post as a noindex 404 and keeps previews out of SSR data", async () => {
    const fetch = mockBlogLookup();
    const missing = await get("/blog/missing-article");
    const preview = await get(`/blog/preview/${post.id}`);

    expect(missing.status).toBe(404);
    expect(missing.text).toContain("Post Not Found");
    expect(missing.text).toContain('content="noindex,follow"');
    expect(preview.headers["x-robots-tag"]).toBe("noindex,follow");
    expect(preview.text).not.toContain('"blog":');
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("returns a retryable 503 when the published article lookup fails", async () => {
    mockBlogLookup(post, false);
    const response = await get(`/blog/${post.slug}`);

    expect(response.status).toBe(503);
    expect(response.headers["retry-after"]).toBe("60");
  });
});
