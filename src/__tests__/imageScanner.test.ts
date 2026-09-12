// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { loadEdgeFunction } from "./helpers/loadEdgeFunction";

const image = (id: string, url = "https://images.example.com/shared.jpg") => ({
  id,
  image_url: url,
  equipment_id: "gear-1",
  equipment: { id: "gear-1", name: "Test Board", category: "surfboards", user_id: "shop-1" },
});

function scanner(rows: ReturnType<typeof image>[], fetch: typeof globalThis.fetch, total = rows.length) {
  const counts = vi.fn().mockResolvedValue({ count: 3 });
  const roles = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: { id: "admin-role" } }),
  };
  const images = {
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data: rows, count: total }),
    eq: counts,
  };
  const client = {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "admin" } } }) },
    from: vi.fn((table: string) => {
      if (table === "user_roles") return roles;
      if (table === "equipment_images") return images;
      throw new Error(`Unexpected table ${table}`);
    }),
  };
  const handler = loadEdgeFunction("scan-broken-images", {
    fetch,
    createClient: () => client,
    resolveDns: async (_, type) => type === "A" ? ["93.184.216.34"] : [],
  });
  return {
    counts,
    run: async () => {
      const response = await handler(new Request("https://local.test", {
        method: "POST",
        headers: { Authorization: "Bearer admin-token" },
      }));
      expect(response.status).toBe(200);
      return response.json();
    },
  };
}

describe("broken image scan classification", () => {
  it("probes a shared URL once and excludes every rate-limited row from deletion", async () => {
    const fetch = vi.fn().mockImplementation(async () => new Response(null, { status: 429 }));
    const scan = scanner(Array.from({ length: 50 }, (_, i) => image(String(i))), fetch, 2000);
    const result = await scan.run();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][1].method).toBe("HEAD");
    expect(result).toMatchObject({ brokenImages: [], scanned: 50, total: 2000, uniqueUrlsChecked: 1 });
    expect(result.inconclusiveImages).toHaveLength(50);
    expect(result.inconclusiveImages[0].errorReason).toContain("429");
    expect(scan.counts).not.toHaveBeenCalled();
  });

  it("stops probing a rate-limited host in subsequent batches", async () => {
    const fetch = vi.fn().mockImplementation(async () => new Response(null, { status: 429 }));
    const rows = Array.from({ length: 21 }, (_, i) => image(String(i), `https://images.example.com/${i}.jpg`));
    const result = await scanner(rows, fetch).run();
    expect(fetch).toHaveBeenCalledTimes(10);
    expect(result.brokenImages).toEqual([]);
    expect(result.inconclusiveImages).toHaveLength(21);
  });

  it("uses GET to recover an image whose CDN rejects HEAD", async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(new Response(null, { headers: { "content-type": "image/jpeg" } }));
    const result = await scanner([image("1")], fetch).run();
    expect(result.brokenImages).toEqual([]);
    expect(result.inconclusiveImages).toEqual([]);
    expect(fetch.mock.calls.map(call => call[1].method)).toEqual(["HEAD", "GET"]);
  });

  it.each([404, 410])("only marks a URL missing after GET confirms HTTP %s", async status => {
    const fetch = vi.fn().mockImplementation(async () => new Response(null, { status }));
    const scan = scanner([image("1"), image("2")], fetch);
    const result = await scan.run();
    expect(result.brokenImages).toHaveLength(2);
    expect(result.brokenImages[0]).toMatchObject({ errorReason: `HTTP ${status}`, gearSlug: "test-board--gear-1", totalImages: 3 });
    expect(result.inconclusiveImages).toEqual([]);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(scan.counts).toHaveBeenCalledTimes(1);
  });

  it.each([403, 500, 503, 200])("keeps HTTP %s without image content inconclusive", async status => {
    const fetch = vi.fn().mockImplementation(async () => new Response(null, { status, headers: { "content-type": "text/html" } }));
    const result = await scanner([image("1")], fetch).run();
    expect(result.brokenImages).toEqual([]);
    expect(result.inconclusiveImages).toHaveLength(1);
    if (status >= 500) expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("keeps network failures and unsafe URLs out of deletion candidates", async () => {
    const fetch = vi.fn().mockRejectedValue(new Error("connection interrupted"));
    const result = await scanner([image("1"), image("2", "https://127.0.0.1/private.jpg")], fetch).run();
    expect(result.brokenImages).toEqual([]);
    expect(result.inconclusiveImages).toHaveLength(2);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
