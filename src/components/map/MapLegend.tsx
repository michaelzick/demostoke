
import { useMatch } from 'react-router-dom';

const gearLegendItems = [
  { category: 'Snowboards', color: 'bg-fuchsia-500' },
  { category: 'Skis', color: 'bg-green-400' },
  { category: 'Surfboards', color: 'bg-sky-500' },
  { category: 'Mountain Bikes', color: 'bg-violet-400' },
];

const profileLegendItems = [
  { category: 'Retail Store', color: 'bg-lime-300' },
  { category: 'Builder', color: 'bg-orange-400' },
  { category: 'Private Party', color: 'bg-rose-500' },
];

interface MapLegendProps {
  activeCategory?: string | null;
}

const MapLegend = ({ activeCategory }: MapLegendProps) => {
  const isSearchRoute = !!useMatch("/search");
  const isExploreRoute = !!useMatch("/explore");

  // Determine which legend to show:
  // - Search route: always show gear legend
  // - Explore route: show gear legend when category is selected, profile legend when showing all
  // - Other routes: show profile legend
  const showGearLegend = isSearchRoute || (isExploreRoute && activeCategory !== null);
  const legendItems = showGearLegend ? gearLegendItems : profileLegendItems;

  return (
    <div className="absolute top-4 left-4 z-10 bg-background/90 p-2 rounded-md backdrop-blur-sm">
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
