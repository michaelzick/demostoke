// Shared SSRF guard for edge functions that fetch user/DB-supplied URLs.
//
// These functions run with the service-role key and can reach the project's
// internal network, so an attacker-controlled URL could be pointed at cloud
// metadata endpoints (169.254.169.254), loopback, or RFC1918 ranges. Require
// HTTPS and reject hostnames that are, or resolve to, private/reserved space.

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "metadata.google.internal",
]);

function ipToParts(host: string): number[] | null {
  const parts = host.split(".");
  if (parts.length !== 4) return null;
  const nums = parts.map((p) => Number(p));
  if (nums.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return null;
  return nums;
}

function isPrivateIPv4(host: string): boolean {
  const parts = ipToParts(host);
  if (!parts) return false;
  const [a, b] = parts;
  if (a === 10) return true; // 10.0.0.0/8
  if (a === 127) return true; // loopback
  if (a === 0) return true; // 0.0.0.0/8
  if (a === 169 && b === 254) return true; // link-local / cloud metadata
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
  if (a === 192 && b === 168) return true; // 192.168.0.0/16
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT 100.64.0.0/10
  return false;
}

function isPrivateIPv6(host: string): boolean {
  const h = host.toLowerCase().replace(/^\[|\]$/g, "");
  if (h === "::1" || h === "::") return true; // loopback / unspecified
  if (h.startsWith("fc") || h.startsWith("fd")) return true; // unique local
  if (h.startsWith("fe80")) return true; // link-local
  if (h.startsWith("::ffff:")) {
    // IPv4-mapped IPv6 — validate the embedded IPv4
    return isPrivateIPv4(h.slice("::ffff:".length));
  }
  return false;
}

/**
 * Validates that a URL is safe to fetch server-side. Throws on rejection.
 * Returns the parsed URL on success.
 */
export function assertSafePublicUrl(rawUrl: unknown): URL {
  if (typeof rawUrl !== "string" || rawUrl.trim() === "") {
    throw new Error("A valid URL string is required");
  }

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error("Invalid URL");
  }

  if (url.protocol !== "https:") {
    throw new Error("Only https URLs are allowed");
  }

  const host = url.hostname.toLowerCase();

  if (BLOCKED_HOSTNAMES.has(host)) {
    throw new Error("URL host is not allowed");
  }

  if (isPrivateIPv4(host) || isPrivateIPv6(host)) {
    throw new Error("URL host resolves to a private or reserved address");
  }

  return url;
}
