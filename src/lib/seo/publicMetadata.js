export const PUBLIC_SITE_URL = "https://www.demostoke.com";

const titleCaseToken = (token) => {
  if (!token) return "";
  if (/^\d+$/.test(token)) return token;
  if (/\d/.test(token) && /[a-z]/.test(token)) return token.toUpperCase();
  if (["ai", "aipa", "api", "bmx", "ci", "doa", "diy", "gps", "mtb", "usa"].includes(token)) {
    return token.toUpperCase();
  }
  if (["a", "an", "and", "as", "at", "by", "for", "in", "of", "on", "or", "the", "to", "vs"].includes(token)) {
    return token;
  }
  return `${token.charAt(0).toUpperCase()}${token.slice(1)}`;
};

export const humanizeSlug = (value) =>
  (value || "")
    .split("-")
    .filter(Boolean)
    .map((token, index) => {
      const formattedToken = titleCaseToken(token);
      if (index > 0) {
        return formattedToken;
      }

      return formattedToken.charAt(0).toUpperCase() + formattedToken.slice(1);
    })
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

export const extractGearNameFromSlug = (gearSlug) => {
  const slugWithoutId = (gearSlug || "").replace(/--[^/]+$/, "");
  const readableSlug = humanizeSlug(slugWithoutId);

  return readableSlug.replace(
    /(\b\d{1,2}) (\d{1,2}\b)(?!.*\b\d{1,2} \d{1,2}\b)/,
    "$1'$2",
  );
};

export const buildBlogPostTitle = (title) => `${title} | DemoStoke`;
export const buildGearDetailTitle = (displayName) => `${displayName} | DemoStoke`;
export const buildUserProfileTitle = (name) => `${name} | DemoStoke`;

const sanitizeMetaText = (value) =>
  (value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/["]+/g, "'")
    .replace(/\s+/g, " ")
    .trim();

const truncateMetaText = (value, maxLength = 160) => {
  if (value.length <= maxLength) {
    return value;
  }

  const truncated = value.slice(0, maxLength - 1).replace(/\s+\S*$/, "").trim();
  return `${truncated}...`;
};

export const buildUserProfileDescription = (name, detail = "") => {
  const baseDescription = `View the profile and listed gear from ${name} on DemoStoke.`;
  const sanitizedDetail = sanitizeMetaText(detail);

  if (!sanitizedDetail) {
    return baseDescription;
  }

  return truncateMetaText(`${baseDescription} ${sanitizedDetail}`);
};

export const PUBLIC_ROUTE_META = {
  "/": {
    title: "Demo & Rent Surfboards, Snowboards, Skis & Mountain Bikes | DemoStoke",
    description:
      "DemoStoke is the go-to marketplace to demo, rent, and try action sports gear from local shops and riders. Surfboards, snowboards, skis, and mountain bikes. Try before you buy.",
    type: "website",
    canonicalUrl: `${PUBLIC_SITE_URL}/`,
  },
  "/about": {
    title: "About DemoStoke | Action Sports Gear Demo Marketplace",
    description:
      "DemoStoke connects riders with local shops, indie shapers, and gear owners for surfboard, snowboard, ski, and mountain bike demos and rentals. Built by riders, for riders.",
    type: "website",
    canonicalUrl: `${PUBLIC_SITE_URL}/about`,
  },
  "/explore": {
    title: "Explore Surfboards, Snowboards, Skis & Bikes Near You | DemoStoke",
    description:
      "Browse available surfboards, snowboards, skis, and mountain bikes for demo and rental near you. Filter by sport, location, skill level, and price.",
    type: "website",
    canonicalUrl: `${PUBLIC_SITE_URL}/explore`,
  },
  "/how-it-works": {
    title: "How DemoStoke Works | Try Before You Buy Gear Rentals",
    description:
      "Browse gear on the DemoStoke map, connect with local shops or owners, try the gear in real conditions, and buy what you love. No lines, no outdated rentals.",
    type: "website",
    canonicalUrl: `${PUBLIC_SITE_URL}/how-it-works`,
  },
  "/blog": {
    title: "Gear Reviews, Surf & Snow Stories | DemoStoke Blog",
    description:
      "Gear reviews, surf and snow culture, demo day calendars, and rider stories from the DemoStoke community.",
    type: "website",
    canonicalUrl: `${PUBLIC_SITE_URL}/blog`,
  },
  "/contact-us": {
    title: "Contact DemoStoke | Questions, Listings & Support",
    description:
      "Have questions about DemoStoke? Want to list your shop or gear? Reach out to the DemoStoke team.",
    type: "website",
    canonicalUrl: `${PUBLIC_SITE_URL}/contact-us`,
  },
  "/list-your-gear": {
    title: "List Your Gear or Shop on DemoStoke | Partner With Us",
    description:
      "List your surf shop, ski rental, or personal gear on DemoStoke. Get discovered by riders looking for demos and rentals in your area. Free to start.",
    type: "website",
    canonicalUrl: `${PUBLIC_SITE_URL}/list-your-gear`,
  },
  "/search": {
    title: "Search Surfboards, Snowboards, Skis & Bikes | DemoStoke",
    description:
      "Search for surfboards, snowboards, skis, and mountain bikes available for demo and rental on DemoStoke.",
    type: "website",
    canonicalUrl: `${PUBLIC_SITE_URL}/search`,
  },
  "/gear": {
    title: "Action Sports Gear Index | DemoStoke",
    description:
      "DemoStoke indexes real-world rental, demo, and used action sports gear with model details, location context, and freshness timestamps.",
    type: "website",
    canonicalUrl: `${PUBLIC_SITE_URL}/gear`,
  },
  "/gear/surfboards": {
    title: "Surfboard Demos & Rentals | DemoStoke",
    description:
      "Browse surfboards available for demo and rental from local surf shops and riders. Shortboards, longboards, fish, mid-lengths, and more.",
    type: "website",
    canonicalUrl: `${PUBLIC_SITE_URL}/gear/surfboards`,
  },
  "/gear/used-skis": {
    title: "Used Ski Rentals & Demos | DemoStoke",
    description:
      "Browse used skis available for rental and demo with current availability, location, and pricing.",
    type: "website",
    canonicalUrl: `${PUBLIC_SITE_URL}/gear/used-skis`,
  },
  "/demo-calendar": {
    title: "Demo Day Calendar | Upcoming Gear Demo Events | DemoStoke",
    description:
      "Find upcoming surfboard, snowboard, and ski demo days near you. Try new gear from top brands at local shops and events.",
    type: "website",
    canonicalUrl: `${PUBLIC_SITE_URL}/demo-calendar`,
  },
  "/gear-quiz": {
    title: "Gear Quiz | Find Your Perfect Board | DemoStoke",
    description:
      "Answer a few questions about your riding style, skill level, and conditions to get personalized gear recommendations from DemoStoke.",
    type: "website",
    canonicalUrl: `${PUBLIC_SITE_URL}/gear-quiz`,
  },
  "/privacy-policy": {
    title: "Privacy Policy | DemoStoke",
    description: "DemoStoke privacy policy. How we collect, use, and protect your data.",
    type: "website",
    canonicalUrl: `${PUBLIC_SITE_URL}/privacy-policy`,
  },
  "/terms-of-service": {
    title: "Terms of Service | DemoStoke",
    description: "DemoStoke terms of service for riders, gear owners, and shop partners.",
    type: "website",
    canonicalUrl: `${PUBLIC_SITE_URL}/terms-of-service`,
  },
  "/user-profile/chad-g": {
    title: "Chad G. | AI Author at DemoStoke",
    description: "About Chad G., AI author at DemoStoke.",
    type: "website",
    canonicalUrl: `${PUBLIC_SITE_URL}/user-profile/chad-g`,
  },
  "/user-profile/gemini": {
    title: "Gemini | AI Author at DemoStoke",
    description: "About Gemini, AI author at DemoStoke.",
    type: "website",
    canonicalUrl: `${PUBLIC_SITE_URL}/user-profile/gemini`,
  },
};

export const getPublicRouteMeta = (path) => PUBLIC_ROUTE_META[path];
