// Application SSRF checks complement network egress restrictions. DNS is checked
// before each hop; this does not pin the connection IP or eliminate DNS rebinding.
const BLOCKED_HOSTNAMES = new Set(["localhost", "metadata.google.internal"]);

function isPublicIPv4(host: string): boolean {
  const parts = host.split(".").map(Number);
  if (
    parts.length !== 4 ||
    parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)
  ) return false;
  const [a, b, c] = parts;
  return !(a === 0 || a === 10 || a === 127 || a >= 224 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 &&
      (b === 168 || (b === 0 && (c === 0 || c === 2)) ||
        (b === 88 && c === 99))) ||
    (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100))) ||
    (a === 203 && b === 0 && c === 113));
}

function isPublicIP(host: string): boolean {
  if (!host.includes(":")) return isPublicIPv4(host);
  // WHATWG URL parsing canonicalizes dotted IPv4 tails into hexadecimal groups.
  let canonical: string;
  try {
    canonical = new URL(`https://[${host}]/`).hostname.slice(1, -1);
  } catch {
    return false;
  }
  const [left, right] = canonical.split("::");
  const head = left ? left.split(":") : [];
  const tail = right ? right.split(":") : [];
  const groups = right !== undefined
    ? [...head, ...Array(8 - head.length - tail.length).fill("0"), ...tail]
    : head;
  const words = groups.map((part) => parseInt(part, 16));
  if (words.length !== 8) return false;
  if (words.slice(0, 5).every((word) => word === 0) && words[5] === 0xffff) {
    return isPublicIPv4(
      `${words[6] >> 8}.${words[6] & 255}.${words[7] >> 8}.${words[7] & 255}`,
    );
  }
  // Only global unicast; exclude special-purpose, documentation and 6to4 ranges.
  return words[0] >= 0x2000 && words[0] <= 0x3fff &&
    !(words[0] === 0x2001 && (words[1] < 0x0200 || words[1] === 0x0db8)) &&
    words[0] !== 0x2002 && !(words[0] === 0x3fff && words[1] < 0x1000);
}

/** Synchronous URL/literal-IP validation. Fetches must also validate DNS and redirects. */
export function assertSafePublicUrl(rawUrl: unknown): URL {
  if (typeof rawUrl !== "string" || !rawUrl.trim()) {
    throw new Error("A valid URL string is required");
  }
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error("Invalid URL");
  }
  if (url.protocol !== "https:") throw new Error("Only https URLs are allowed");
  if (url.username || url.password) {
    throw new Error("URL credentials are not allowed");
  }
  const host = url.hostname.toLowerCase().replace(/\.+$/, "");
  const literal = host.replace(/^\[|\]$/g, "");
  if (
    !host || BLOCKED_HOSTNAMES.has(host) || host.endsWith(".localhost") ||
    host.endsWith(".local") || host.endsWith(".internal") ||
    ((host.includes(":") || /^[\d.]+$/.test(host)) && !isPublicIP(literal))
  ) {
    throw new Error("URL host is not a public address");
  }
  url.hostname = host;
  return url;
}

type DnsResolver = (hostname: string, type: "A" | "AAAA") => Promise<string[]>;
// Keep this helper type-checkable in Node-based regression tests as well as Deno.
declare const Deno: { resolveDns: DnsResolver };

type FetchOptions = {
  method?: "GET" | "HEAD";
  headers?: HeadersInit;
  discardBody?: boolean;
  timeoutMs?: number;
  maxBytes?: number;
  maxRedirects?: number;
};

const resolveDns: DnsResolver = (hostname, type) =>
  Deno.resolveDns(hostname, type);

/** Bounded download, or a header probe that cancels the body immediately. */
export async function fetchPublicResource(
  rawUrl: string,
  options: FetchOptions = {},
  dependencies: { fetch?: typeof fetch; resolveDns?: DnsResolver } = {},
): Promise<
  {
    ok: boolean;
    status: number;
    headers: Headers;
    body: Uint8Array<ArrayBuffer>;
  }
> {
  const fetcher = dependencies.fetch ?? fetch;
  const resolver = dependencies.resolveDns ?? resolveDns;
  const controller = new AbortController();
  const maxBytes = options.maxBytes ?? 20 * 1024 * 1024;
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new Error("Image request timed out"));
    }, options.timeoutMs ?? 15_000);
  });

  const download = async () => {
    let url = assertSafePublicUrl(rawUrl);
    for (let redirects = 0;; redirects++) {
      const host = url.hostname.replace(/^\[|\]$/g, "");
      if (!host.includes(":") && !/^[\d.]+$/.test(host)) {
        const answers = await Promise.allSettled([
          resolver(host, "A"),
          resolver(host, "AAAA"),
        ]);
        // A missing record family is normal; resolver failures must fail closed.
        for (const answer of answers) {
          if (
            answer.status === "rejected" && answer.reason?.name !== "NotFound"
          ) {
            throw new Error("Unable to validate URL host");
          }
        }
        const addresses = answers.flatMap((answer) =>
          answer.status === "fulfilled" ? answer.value : []
        );
        if (
          !addresses.length || addresses.some((address) => !isPublicIP(address))
        ) {
          throw new Error("URL host is not a public address");
        }
      }
      controller.signal.throwIfAborted();
      const response = await fetcher(url, {
        method: options.method ?? "GET",
        headers: options.headers,
        redirect: "manual",
        signal: controller.signal,
      });
      try {
        controller.signal.throwIfAborted();
        if ([301, 302, 303, 307, 308].includes(response.status)) {
          const location = response.headers.get("location");
          if (!location || redirects >= (options.maxRedirects ?? 5)) {
            throw new Error("Invalid or excessive image redirects");
          }
          url = assertSafePublicUrl(new URL(location, url).href);
          continue;
        }
        const result = {
          ok: response.ok,
          status: response.status,
          headers: response.headers,
        };
        if (options.discardBody || options.method === "HEAD" || !response.ok) {
          return { ...result, body: new Uint8Array() };
        }
        if (Number(response.headers.get("content-length")) > maxBytes) {
          throw new Error("Image exceeds size limit");
        }
        const chunks: Uint8Array[] = [];
        let size = 0;
        const reader = response.body?.getReader();
        if (reader) {
          try {
            while (true) {
              const { done, value } = await reader.read();
              controller.signal.throwIfAborted();
              if (done) break;
              size += value.byteLength;
              if (size > maxBytes) throw new Error("Image exceeds size limit");
              chunks.push(value);
            }
          } finally {
            try {
              await reader.cancel();
            } finally {
              reader.releaseLock();
            }
          }
        }
        const body = new Uint8Array(size);
        let offset = 0;
        for (const chunk of chunks) {
          body.set(chunk, offset);
          offset += chunk.byteLength;
        }
        return { ...result, body };
      } finally {
        await response.body?.cancel();
      }
    }
  };
  try {
    return await Promise.race([download(), timeout]);
  } finally {
    clearTimeout(timer!);
    controller.abort();
  }
}
