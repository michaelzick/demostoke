
import { useMatch } from 'react-router-dom';
import { GEAR_CATEGORIES, type GearCategorySlug } from '@/lib/gearCategories';

const GEAR_LEGEND_COLORS: Record<GearCategorySlug, string> = {
  surfboards: 'bg-sky-500',
  snowboards: 'bg-rose-500',
  skis: 'bg-fuchsia-500',
  'mountain-bikes': 'bg-orange-400',
};

// Legend order follows the shared surf-first category list.
const gearLegendItems = GEAR_CATEGORIES.map((category) => ({
  category: category.label,
  color: GEAR_LEGEND_COLORS[category.slug],
}));

const profileLegendItems = [
  { category: 'Retail Store', color: 'bg-fuchsia-500' },
  { category: 'Builder', color: 'bg-orange-400' },
  { category: 'Private Party', color: 'bg-rose-500' },
];

interface MapLegendProps {
  activeCategory?: string | null;
  viewMode?: 'map' | 'list' | 'hybrid';
}

const MapLegend = ({ activeCategory, viewMode }: MapLegendProps) => {
  const isSearchRoute = !!useMatch("/search");
  const isExploreRoute = !!useMatch("/explore");
  const isHybridView = viewMode === 'hybrid';

  // Determine which legend to show:
  // - Search route: always show gear legend
  // - Hybrid view: always show gear legend
  // - Explore route: show gear legend when category is selected, profile legend when showing all
  // - Other routes: show profile legend
  const showGearLegend = isSearchRoute || isHybridView || (isExploreRoute && activeCategory !== null);
  const legendItems = showGearLegend ? gearLegendItems : profileLegendItems;

  return (
    <div className="pointer-events-none absolute top-4 left-4 z-10 bg-background/90 p-2 rounded-md backdrop-blur-sm">
      <div className="flex flex-col gap-2">
        {legendItems.map((item) => (
          <div key={item.category} className="flex items-center gap-2">
            <div className={`h-4 w-4 rounded ${item.color}`} />
            <span className="text-xs font-medium">{item.category}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapLegend;
