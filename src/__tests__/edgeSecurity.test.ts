// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { loadEdgeFunction } from "./helpers/loadEdgeFunction";

const endpoints = [
  "rental-discovery-agent",
  "crawl-retailer-details",
  "extract-gear-from-html",
  "generate-blog-text",
  "generate-blog-post",
];
const request = (body: unknown, token: string | null = "valid-token") =>
  new Request("https://local.test/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
function clientMock(admin = false, valid = true) {
  const saved: Record<string, unknown>[] = [];
  const query = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({
      data: admin ? { id: "role" } : null,
      error: null,
    }),
    insert: vi.fn((rows: Record<string, unknown>[]) => {
      saved.push(...rows);
      return query;
    }),
    single: vi.fn(async () => ({
      data: { id: "post", ...saved[0] },
      error: null,
    })),
  };
  const client = {
    auth: {
      getUser: vi.fn(async () => ({
        data: { user: valid ? { id: "verified-user" } : null },
        error: null,
      })),
    },
    from: vi.fn(() => query),
  };
  return { client, query, saved, createClient: vi.fn(() => client) };
}

describe("generation and discovery authorization", () => {
  it.each(endpoints)(
    "%s rejects missing/invalid identity before paid work",
    async (endpoint) => {
      const mock = clientMock(false, false);
      const fetch = vi.fn();
      const handler = loadEdgeFunction(endpoint, {
        fetch,
        createClient: mock.createClient,
      });
      expect((await handler(request({}, null))).status).toBe(401);
      expect((await handler(request({}, "expired"))).status).toBe(401);
      expect(fetch).not.toHaveBeenCalled();
      expect(mock.client.from).not.toHaveBeenCalled();
    },
  );
  it.each(endpoints.slice(0, 3))(
    "%s requires the database admin role",
    async (endpoint) => {
      const mock = clientMock();
      const fetch = vi.fn();
      const handler = loadEdgeFunction(endpoint, {
        fetch,
        createClient: mock.createClient,
      });
      expect((await handler(request({}))).status).toBe(403);
      expect(fetch).not.toHaveBeenCalled();
      expect(mock.query.eq).toHaveBeenCalledWith("user_id", "verified-user");
      expect(mock.query.eq).toHaveBeenCalledWith("role", "admin");
    },
  );
  it.each([
    ["rental-discovery-agent", { maxShops: 10000 }],
    ["crawl-retailer-details", { urls: ["javascript:void(0)"] }],
    ["extract-gear-from-html", { html: "x".repeat(200001) }],
    ["generate-blog-text", { prompt: {}, category: "surf" }],
    ["generate-blog-post", { prompt: "surf", tags: "wrong-type" }],
  ])("%s rejects invalid input without paid work", async (endpoint, body) => {
    const mock = clientMock(true);
    const fetch = vi.fn();
    const handler = loadEdgeFunction(endpoint as string, {
      fetch,
      createClient: mock.createClient,
    });
    expect((await handler(request(body))).status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
    expect(mock.query.insert).not.toHaveBeenCalled();
  });
  it.each([
    ["rental-discovery-agent", {}, { items: [] }],
    ["crawl-retailer-details", { urls: ["https://shop.example.com"] }, {
      data: [{
        url: "https://shop.example.com",
        html: "<p>Shop</p>",
        markdown: "Surfboard rentals",
      }],
    }],
    ["extract-gear-from-html", { html: "<p>Surfboard rental</p>" }, {
      choices: [{
        message: {
          content:
            '{"name":"Board","category":"surfboards","sizes":[],"currency_code":"MXN"}',
        },
      }],
    }],
  ])(
    "%s remains usable by verified admins",
    async (endpoint, body, providerData) => {
      const mock = clientMock(true);
      const fetch = vi.fn().mockImplementation(async () =>
        Response.json(providerData)
      );
      const handler = loadEdgeFunction(endpoint as string, {
        fetch,
        createClient: mock.createClient,
      });
      expect((await handler(request(body))).status).toBe(200);
      expect(fetch).toHaveBeenCalled();
    },
  );
  it("rejects malformed or oversized bodies before paid work", async () => {
    const mock = clientMock();
    const fetch = vi.fn();
    const handler = loadEdgeFunction("generate-blog-text", {
      fetch,
      createClient: mock.createClient,
    });
    const malformed = new Request("https://local.test", {
      method: "POST",
      headers: { Authorization: "Bearer valid-token" },
      body: "{",
    });
    expect((await handler(malformed)).status).toBe(400);
    expect((await handler(request({ prompt: "x".repeat(70000) }))).status).toBe(
      413,
    );
    expect(fetch).not.toHaveBeenCalled();
  });
  it("allows a signed-in non-admin editor to generate blog text", async () => {
    const mock = clientMock();
    const fetch = vi.fn().mockResolvedValueOnce(
      Response.json({
        choices: [{ message: { content: "<p>A surfboard review.</p>" } }],
      }),
    )
      .mockResolvedValueOnce(
        Response.json({
          choices: [{
            message: {
              content: '{"title":"Board review","excerpt":"A useful review"}',
            },
          }],
        }),
      );
    const handler = loadEdgeFunction("generate-blog-text", {
      fetch,
      createClient: mock.createClient,
    });
    const response = await handler(
      request({ prompt: "Review this surfboard", category: "surfboards" }),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      success: true,
      title: "Board review",
    });
    expect(mock.client.from).not.toHaveBeenCalled();
  });
  it("saves generated posts through the caller JWT with verified ownership", async () => {
    const mock = clientMock();
    const fetch = vi.fn().mockResolvedValue(
      Response.json({
        choices: [{
          message: {
            content: JSON.stringify({
              title: "Board review",
              excerpt: "Review",
              content: "Ride report",
            }),
          },
        }],
      }),
    );
    const handler = loadEdgeFunction("generate-blog-post", {
      fetch,
      createClient: mock.createClient,
    });
    const response = await handler(
      request({
        prompt: "Review",
        category: "surfboards",
        author: "Editor",
        publishedAt: "2026-09-12T12:00:00Z",
        user_id: "someone-else",
      }),
    );
    expect(response.status).toBe(200);
    expect(mock.saved[0]).toMatchObject({
      user_id: "verified-user",
      author_id: "editor",
    });
    expect(mock.createClient).toHaveBeenCalledWith(
      "https://project.supabase.co",
      "test-SUPABASE_ANON_KEY",
      expect.objectContaining({
        global: { headers: { Authorization: "Bearer valid-token" } },
      }),
    );
  });
  it("preserves preflight responses without authentication", async () => {
    const fetch = vi.fn();
    for (const endpoint of endpoints) {
      const handler = loadEdgeFunction(endpoint, { fetch });
      expect(
        (await handler(
          new Request("https://local.test", { method: "OPTIONS" }),
        )).status,
      ).toBe(200);
    }
    expect(fetch).not.toHaveBeenCalled();
  });
});

const contact = {
  firstName: "Ada",
  lastName: "Surfer",
  email: "ada@example.com",
  subject: "Rentals",
  message: "Hello\nWorld",
  captchaToken: "captcha",
};
describe("anonymous contact form", () => {
  it("escapes submitted HTML and preserves line breaks without exposing provider data", async () => {
    const sendEmail = vi.fn().mockResolvedValue({
      data: { id: "private-provider-id" },
      error: null,
    });
    const fetch = vi.fn().mockResolvedValue(Response.json({ success: true }));
    const handler = loadEdgeFunction("send-contact-email", {
      fetch,
      sendEmail,
    });
    const response = await handler(
      request({
        ...contact,
        firstName: "<b>Ada</b>",
        message: '<img src=x onerror="void 0">\nHello',
      }, null),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
    expect(sendEmail.mock.calls[0][0].html).toContain("&lt;b&gt;Ada&lt;/b&gt;");
    expect(sendEmail.mock.calls[0][0].html).toContain(
      "&lt;img src=x onerror=&quot;void 0&quot;&gt;<br>Hello",
    );
  });
  it.each([
    { email: "bad" },
    { subject: "hello\r\nBcc: a@example.com" },
    { message: {} },
    { firstName: "x".repeat(101) },
    { message: "x".repeat(10001) },
  ])("rejects invalid fields before captcha or email", async (fields) => {
    const fetch = vi.fn(), sendEmail = vi.fn();
    const handler = loadEdgeFunction("send-contact-email", {
      fetch,
      sendEmail,
    });
    expect((await handler(request({ ...contact, ...fields }, null))).status)
      .toBe(400);
    expect(fetch).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
  });
  it("rejects failed captcha and never sends mail", async () => {
    const sendEmail = vi.fn();
    const handler = loadEdgeFunction("send-contact-email", {
      fetch: vi.fn().mockResolvedValue(Response.json({ success: false })),
      sendEmail,
    });
    expect((await handler(request(contact, null))).status).toBe(400);
    expect(sendEmail).not.toHaveBeenCalled();
  });
  it("reports provider-returned errors as failures without leaking details", async () => {
    const handler = loadEdgeFunction("send-contact-email", {
      fetch: vi.fn().mockResolvedValue(Response.json({ success: true })),
      sendEmail: vi.fn().mockResolvedValue({
        data: null,
        error: { message: "private diagnostic" },
      }),
    });
    const response = await handler(request(contact, null));
    expect(response.status).toBe(502);
    expect(await response.text()).not.toContain("private diagnostic");
  });
});
