import { Link } from "react-router-dom";
import usePageMetadata from "@/hooks/usePageMetadata";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PUBLIC_ROUTE_META } from "@/lib/seo/publicMetadata";

interface GearCategoryPageProps {
  categoryKey: "surfboards" | "used-skis";
}

const categoryConfig: Record<
  GearCategoryPageProps["categoryKey"],
  {
    title: string;
    description: string;
    pathname: string;
    canonicalUrl: string;
    exploreHref: string;
    searchHref: string;
    searchLabel: string;
    h1: string;
    intro: string;
    bodyContent: string[];
    dbCategory: string;
  }
> = {
  surfboards: {
    title: "Surfboard Demos & Rentals | DemoStoke",
    description:
      "Browse surfboards available for demo and rental from local surf shops and riders. Shortboards, longboards, fish, mid-lengths, and more. Try before you buy on DemoStoke.",
    pathname: "/gear/surfboards",
    canonicalUrl: "https://www.demostoke.com/gear/surfboards",
    exploreHref: "/explore?category=surfboards",
    searchHref: "/search?q=surfboards",
    searchLabel: "Search surfboards",
    h1: "Surfboard Demos & Rentals",
    intro: "Find surfboards available for demo and rental from local surf shops, indie shapers, and fellow riders.",
    bodyContent: [
      "Buying a surfboard without riding it first is like buying shoes without trying them on. Board dimensions, rocker profile, and construction all affect how a board performs in your specific conditions and at your skill level. DemoStoke lets you try boards in real surf before committing.",
      "Browse shortboards, longboards, fish, mid-lengths, foam tops, and SUPs from shops and shapers in your area. Filter by location, price, and skill level to find boards matched to how you actually surf.",
      "Many shops on DemoStoke offer try-before-you-buy programs where your rental fee is credited toward purchase. It's the smartest way to find your next daily driver.",
    ],
    dbCategory: "surfboards",
  },
  "used-skis": {
    title: "Used Ski Rentals & Demos | DemoStoke",
    description:
      "Browse used skis available for rental and demo with current availability, location, and pricing on DemoStoke.",
    pathname: "/gear/used-skis",
    canonicalUrl: "https://www.demostoke.com/gear/used-skis",
    exploreHref: "/explore?category=skis&q=used",
    searchHref: "/search?q=used+skis",
    searchLabel: "Search used skis",
    h1: "Used Ski Rentals & Demos",
    intro: "Find used skis available for rental and demo near mountain resorts and ski towns.",
    bodyContent: [
      "Demo days and rental programs are the best way to test skis before buying — especially used skis where you want to verify condition and performance firsthand. DemoStoke aggregates available used ski inventory from shops and individual owners with current pricing and location data.",
      "Browse all-mountain, powder, park, touring, and cross-country skis. Each listing includes model details, size, condition notes, and last-verified timestamps so you know what's actually available.",
    ],
    dbCategory: "skis",
  },
};

const GearCategoryPage = ({ categoryKey }: GearCategoryPageProps) => {
  const config = categoryConfig[categoryKey];
  const routeMeta = PUBLIC_ROUTE_META[config.pathname];

  const { data: gearCount } = useQuery({
    queryKey: ["gear-count", config.dbCategory],
    queryFn: async () => {
      const { count } = await supabase
        .from("equipment")
        .select("*", { count: "exact", head: true })
        .ilike("category", `%${config.dbCategory}%`);
      return count || 0;
    },
  });

  usePageMetadata({
    ...routeMeta,
    canonicalUrl: config.canonicalUrl,
    schema: {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://www.demostoke.com/" },
        { "@type": "ListItem", position: 2, name: "Gear", item: "https://www.demostoke.com/gear" },
        { "@type": "ListItem", position: 3, name: config.h1, item: config.canonicalUrl },
      ]
    }
  });

  return (
    <div className="container px-4 md:px-6 py-10 max-w-4xl">
      <h1 className="text-3xl font-bold mb-4">{config.h1}</h1>
      <p className="text-lg text-muted-foreground mb-2">{config.intro}</p>
      {typeof gearCount === "number" && gearCount > 0 && (
        <p className="text-sm text-muted-foreground mb-6">
          {gearCount} {categoryKey === "surfboards" ? "surfboards" : "skis"} currently listed on DemoStoke.
        </p>
      )}

      <div className="space-y-4 text-muted-foreground leading-relaxed mb-8">
        {config.bodyContent.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          to={config.exploreHref}
        >
          Browse listings
        </Link>
        <Link
          className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
          to={config.searchHref}
        >
          {config.searchLabel}
        </Link>
      </div>
    </div>
  );
};

export default GearCategoryPage;
