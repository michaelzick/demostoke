// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  assertSafePublicUrl,
  fetchPublicResource,
} from "../../supabase/functions/_shared/urlSafety";

const publicDns = vi.fn(async (_host: string, type: "A" | "AAAA") =>
  type === "A" ? ["93.184.216.34"] : []
);
afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe("image URL validation", () => {
  it.each([
    "http://example.com/a.jpg",
    "https://localhost./",
    "https://x.localhost/",
    "https://metadata.google.internal/",
    "https://127.0.0.1/",
    "https://2130706433/",
    "https://0x7f000001/",
    "https://10.1.2.3/",
    "https://172.31.255.255/",
    "https://192.168.1.1/",
    "https://169.254.169.254/",
    "https://100.64.0.1/",
    "https://198.19.1.1/",
    "https://224.0.0.1/",
    "https://192.0.2.1/",
    "https://[::]/",
    "https://[::1]/",
    "https://[::ffff:127.0.0.1]/",
    "https://[::ffff:7f00:1]/",
    "https://[fe90::1]/",
    "https://[febf::1]/",
    "https://[fd00::1]/",
    "https://[ff02::1]/",
    "https://[2002:7f00:1::]/",
    "https://[2001:db8::1]/",
    "https://user:password@example.com/",
  ])("rejects %s", (url) => expect(() => assertSafePublicUrl(url)).toThrow());
  it.each([
    "https://images.pexels.com/a.jpg",
    "https://8.8.8.8/",
    "https://[2606:4700:4700::1111]/",
    "https://[::ffff:8.8.8.8]/",
  ])(
    "allows public source %s",
    (url) => expect(assertSafePublicUrl(url).protocol).toBe("https:"),
  );
  it("normalizes trailing-dot public hostnames", () =>
    expect(assertSafePublicUrl("https://example.com./").hostname).toBe(
      "example.com",
    ));
});

describe("bounded image fetch", () => {
  it("follows public relative/CDN redirects manually and checks DNS at each hop", async () => {
    const fetch = vi.fn().mockResolvedValueOnce(
      new Response(null, { status: 302, headers: { Location: "/next" } }),
    )
      .mockResolvedValueOnce(
        new Response(null, {
          status: 307,
          headers: { Location: "https://cdn.example.com/image" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(new Uint8Array([1, 2, 3]), {
          headers: { "Content-Type": "image/png" },
        }),
      );
    const result = await fetchPublicResource("https://example.com/image", {}, {
      fetch,
      resolveDns: publicDns,
    });
    expect([...result.body]).toEqual([1, 2, 3]);
    expect(fetch).toHaveBeenCalledTimes(3);
    expect(publicDns).toHaveBeenCalledTimes(6);
    expect(publicDns).toHaveBeenCalledWith("cdn.example.com", "AAAA");
    expect(fetch.mock.calls.every(([, init]) => init.redirect === "manual"))
      .toBe(true);
  });
  it("rejects a redirect to a private host before fetching it", async () => {
    const fetch = vi.fn().mockResolvedValue(
      new Response(null, {
        status: 302,
        headers: { Location: "https://[::ffff:127.0.0.1]/" },
      }),
    );
    await expect(
      fetchPublicResource("https://example.com/image", {}, {
        fetch,
        resolveDns: publicDns,
      }),
    ).rejects.toThrow("public");
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it("rejects any private DNS answer, including an IPv6 answer after a redirect", async () => {
    const fetch = vi.fn().mockResolvedValue(
      new Response(null, {
        status: 302,
        headers: { Location: "https://internal.example.com/" },
      }),
    );
    const resolveDns = vi.fn(async (host: string, type: "A" | "AAAA") =>
      host.startsWith("internal") && type === "AAAA"
        ? ["fe90::1"]
        : ["93.184.216.34"]
    );
    await expect(
      fetchPublicResource("https://example.com/image", {}, {
        fetch,
        resolveDns,
      }),
    ).rejects.toThrow("public");
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it("fails closed on resolver failures, but accepts a missing record family", async () => {
    const fetch = vi.fn().mockImplementation(async () => new Response("ok"));
    const missing = Object.assign(new Error("No AAAA"), { name: "NotFound" });
    await expect(
      fetchPublicResource("https://example.com/", {}, {
        fetch,
        resolveDns: async (_host, type) => {
          if (type === "AAAA") throw missing;
          return ["93.184.216.34"];
        },
      }),
    ).resolves.toMatchObject({ ok: true });
    await expect(
      fetchPublicResource("https://example.com/", {}, {
        fetch,
        resolveDns: async () => {
          throw new Error("DNS down");
        },
      }),
    ).rejects.toThrow("validate");
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it("limits redirects", async () => {
    const fetch = vi.fn().mockImplementation(async () =>
      new Response(null, { status: 302, headers: { Location: "/again" } })
    );
    await expect(
      fetchPublicResource("https://example.com/", { maxRedirects: 1 }, {
        fetch,
        resolveDns: publicDns,
      }),
    ).rejects.toThrow("redirects");
    expect(fetch).toHaveBeenCalledTimes(2);
  });
  it("enforces the advertised and streamed byte limits and cancels bodies", async () => {
    for (const headers of [{ "Content-Length": "100" }, {}]) {
      const cancel = vi.fn();
      const body = new ReadableStream({
        start(controller) {
          controller.enqueue(new Uint8Array(10));
        },
        cancel,
      });
      const fetch = vi.fn().mockResolvedValue(new Response(body, { headers }));
      await expect(
        fetchPublicResource("https://example.com/", { maxBytes: 5 }, {
          fetch,
          resolveDns: publicDns,
        }),
      ).rejects.toThrow("size limit");
      expect(cancel).toHaveBeenCalled();
      expect(body.locked).toBe(false);
    }
  });
  it("cancels probe and error bodies without buffering", async () => {
    for (const [status, discardBody] of [[200, true], [404, false]] as const) {
      const cancel = vi.fn();
      const fetch = vi.fn().mockResolvedValue(
        new Response(new ReadableStream({ cancel }), { status }),
      );
      const result = await fetchPublicResource("https://example.com/", {
        discardBody,
      }, { fetch, resolveDns: publicDns });
      expect(result.body.byteLength).toBe(0);
      expect(cancel).toHaveBeenCalled();
    }
  });
  it("times out DNS before any request can start", async () => {
    vi.useFakeTimers();
    let resolve!: (value: string[]) => void;
    const dns = new Promise<string[]>((done) => {
      resolve = done;
    });
    const fetch = vi.fn();
    const pending = fetchPublicResource("https://example.com/", {
      timeoutMs: 10,
    }, { fetch, resolveDns: () => dns });
    const assertion = expect(pending).rejects.toThrow("timed out");
    await vi.advanceTimersByTimeAsync(10);
    await assertion;
    resolve(["93.184.216.34"]);
    await vi.advanceTimersByTimeAsync(1);
    expect(fetch).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("aborts a stalled response body and clears its timeout", async () => {
    vi.useFakeTimers();
    const fetch = vi.fn(async (_url, init) =>
      new Response(
        new ReadableStream({
          start(controller) {
            init.signal.addEventListener(
              "abort",
              () => controller.error(new Error("aborted")),
              { once: true },
            );
          },
        }),
      )
    );
    const pending = fetchPublicResource("https://example.com/", {
      timeoutMs: 10,
    }, { fetch, resolveDns: publicDns });
    const assertion = expect(pending).rejects.toThrow("timed out");
    await vi.advanceTimersByTimeAsync(10);
    await assertion;
    expect(fetch.mock.calls[0][1].signal.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });
});
