
import { useAppSettings } from '@/hooks/useAppSettings';

const gearLegendItems = [
  { category: 'Snowboards', color: 'bg-fuchsia-500' },
  { category: 'Skis', color: 'bg-green-400' },
  { category: 'Surfboards', color: 'bg-sky-500' },
  { category: 'Mountain Bikes', color: 'bg-red-600' },
];

const profileLegendItems = [
  { category: 'Retail Store', color: 'bg-lime-300' },
  { category: 'Builder', color: 'bg-orange-500' },
  { category: 'Private Party', color: 'bg-rose-600' },
];

interface MapLegendProps {
  activeCategory?: string | null;
}

const MapLegend = ({ activeCategory }: MapLegendProps) => {
  const { data: appSettings } = useAppSettings();
  const isUserLocationMode = appSettings?.map_display_mode === 'user_locations';

  // Show gear legend when a specific category is selected, profile legend otherwise
  const showGearLegend = isUserLocationMode && activeCategory;
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
