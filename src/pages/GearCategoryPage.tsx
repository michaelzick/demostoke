import { Link } from "react-router-dom";
import usePageMetadata from "@/hooks/usePageMetadata";

interface GearCategoryPageProps {
  categoryKey: "surfboards" | "used-skis";
}

const categoryConfig: Record<
  GearCategoryPageProps["categoryKey"],
  {
    title: string;
    description: string;
    canonicalUrl: string;
    exploreHref: string;
    searchHref: string;
    searchLabel: string;
  }
> = {
  surfboards: {
    title: "Surfboard Gear Index | DemoStoke",
    description:
      "Browse DemoStoke surfboard listings with model, size, location, and freshness signals.",
    canonicalUrl: "https://www.demostoke.com/gear/surfboards",
    exploreHref: "/explore?category=surfboards",
    searchHref: "/search?q=surfboards",
    searchLabel: "Search surfboards",
  },
  "used-skis": {
    title: "Used Ski Gear Index | DemoStoke",
    description:
      "Browse DemoStoke used ski listings and rentals with current availability and location.",
    canonicalUrl: "https://www.demostoke.com/gear/used-skis",
    exploreHref: "/explore?category=skis&q=used",
    searchHref: "/search?q=used+skis",
    searchLabel: "Search used skis",
  },
};

const GearCategoryPage = ({ categoryKey }: GearCategoryPageProps) => {
  const config = categoryConfig[categoryKey];

  usePageMetadata({
    title: config.title,
    description: config.description,
    canonicalUrl: config.canonicalUrl,
  });

  return (
    <div className="container px-4 md:px-6 py-10 max-w-4xl">
      <h1 className="text-3xl font-bold mb-4">
        {categoryKey === "surfboards" ? "Surfboards" : "Used Skis"} on DemoStoke
      </h1>
      <p className="text-muted-foreground mb-8">{config.description}</p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          className="underline text-primary hover:text-primary/80"
          to={config.exploreHref}
        >
          Browse category listings
        </Link>
        <Link
          className="underline text-primary hover:text-primary/80"
          to={config.searchHref}
        >
          {config.searchLabel}
        </Link>
      </div>
    </div>
  );
};

export default GearCategoryPage;
