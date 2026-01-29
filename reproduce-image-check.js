
const urls = [
  "https://cdn11.bigcommerce.com/s-186hk/images/stencil/1280x1280/products/104801/189055/2025-nordica-enforcer-89-skis__12743.1736874888.jpg?c=2",
  "https://images.snowleader.com/cdn-cgi/image/f=auto,fit=scale-down,q=85/https://images.snowleader.com/media/catalog/product/cache/1/image/0dc2d03fe217f8c83829496872af24a0/N/O/NORD0047",
  "https://images.snowleader.com/media/catalog/product/cache/1/image/0dc2d03fe217f8c83829496872af24a0/N/O/NORD0047"
];

async function checkUrl(url) {
  console.log(`\n--- Checking: ${url} ---`);

  // Test HEAD
  try {
    const start = Date.now();
    const headRes = await fetch(url, {
      method: "HEAD",
      headers: { "User-Agent": "DemoStoke-ImageChecker/1.0" },
      redirect: "follow"
    });
    console.log(`HEAD Status: ${headRes.status}`);
    console.log(`HEAD Content-Type: ${headRes.headers.get("content-type")}`);
    console.log(`HEAD Content-Length: ${headRes.headers.get("content-length")}`);
  } catch (e) {
    console.log(`HEAD Error: ${e.message}`);
  }

  // Test GET
  try {
    const start = Date.now();
    const getRes = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Referer": "https://www.google.com/",
        "Sec-Ch-Ua": '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"macOS"',
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "cross-site",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1"
      },
      redirect: "follow"
    });
    console.log(`GET Status: ${getRes.status}`);
    console.log(`GET Content-Type: ${getRes.headers.get("content-type")}`);
    console.log(`GET Content-Length: ${getRes.headers.get("content-length")}`);

    if (getRes.ok) {
      // Peek at start of body
      const buffer = await getRes.arrayBuffer();
      const bytes = new Uint8Array(buffer).slice(0, 20);
      console.log(`First 20 bytes:`, bytes);
      const text = new TextDecoder().decode(bytes);
      console.log(`First 20 chars (text):`, text);
    }

  } catch (e) {
    console.log(`GET Error: ${e.message}`);
  }
}

async function run() {
  for (const url of urls) {
    await checkUrl(url);
  }
}

run();
