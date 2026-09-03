/**
 * Ordered list of public gear categories for client-side UI.
 *
 * DemoStoke is surf-first: surfboards lead every category list (nav, hero,
 * explore filters, quiz). The other three categories stay fully supported as
 * long-tail inventory. Change the order here and every UI surface follows.
 *
 * Route parsing uses its own list in `src/lib/seo/gearSeo.js`, and the Deno
 * edge functions keep separate copies because they cannot import from `src`.
 */
export const GEAR_CATEGORIES = [
  { slug: "surfboards", label: "Surfboards", shortLabel: "Surf" },
  { slug: "snowboards", label: "Snowboards", shortLabel: "Snow" },
  { slug: "skis", label: "Skis", shortLabel: "Ski" },
  { slug: "mountain-bikes", label: "Mountain Bikes", shortLabel: "Bike" },
] as const;

export type GearCategorySlug = (typeof GEAR_CATEGORIES)[number]["slug"];

export const GEAR_CATEGORY_LABELS: Record<GearCategorySlug, string> = Object.fromEntries(
  GEAR_CATEGORIES.map((category) => [category.slug, category.label]),
) as Record<GearCategorySlug, string>;

/**
 * Blog post categories: the gear categories in canonical order (blog uses the
 * lowercase label, e.g. "mountain bikes", not the slug), then editorial ones.
 */
export const BLOG_CATEGORIES: readonly string[] = [
  ...GEAR_CATEGORIES.map((category) => category.label.toLowerCase()),
  "gear reviews",
  "stories that stoke",
  "stories that suck",
];

const GEAR_CATEGORY_INDEX = new Map<string, number>(
  GEAR_CATEGORIES.map((category, index) => [category.slug, index]),
);

/** Sort category slugs into GEAR_CATEGORIES order; unknown values go last, alphabetically. */
export const sortByGearCategoryOrder = (categories: string[]): string[] =>
  [...categories].sort((a, b) => {
    const ai = GEAR_CATEGORY_INDEX.get(a) ?? Number.MAX_SAFE_INTEGER;
    const bi = GEAR_CATEGORY_INDEX.get(b) ?? Number.MAX_SAFE_INTEGER;
    return ai === bi ? a.localeCompare(b) : ai - bi;
  });

/** App Store listing for Riptyde, the DemoStoke surf-forecasting companion app. */
export const RIPTYDE_APP_STORE_URL = "https://apps.apple.com/us/app/riptyde/id6793336480";
