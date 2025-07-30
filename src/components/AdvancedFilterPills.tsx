import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { AdvancedFilters, PRICE_RANGES, RATING_RANGES } from "@/types/advancedFilters";

interface AdvancedFilterPillsProps {
  filters: AdvancedFilters;
  onRemovePriceRange: (rangeId: string) => void;
  onRemoveRatingRange: (rangeId: string) => void;
}

export function AdvancedFilterPills({
  filters,
  onRemovePriceRange,
  onRemoveRatingRange,
}: AdvancedFilterPillsProps) {
  const selectedPriceRanges = PRICE_RANGES.filter(range => 
    filters.priceRanges.includes(range.id)
  );
  
  const selectedRatingRanges = RATING_RANGES.filter(range => 
    filters.ratingRanges.includes(range.id)
  );

  const hasFilters = selectedPriceRanges.length > 0 || selectedRatingRanges.length > 0;

  if (!hasFilters) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {selectedPriceRanges.map((range) => (
        <Badge
          key={range.id}
          variant="outline"
          className="flex items-center gap-1 px-2 py-1 bg-fuchsia-500 text-white border-transparent"
        >
          <span className="text-xs">{range.label}</span>
          <button
            onClick={() => onRemovePriceRange(range.id)}
            className="ml-1 hover:bg-destructive/10 rounded-full p-0.5"
            aria-label={`Remove ${range.label} filter`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      
      {selectedRatingRanges.map((range) => (
        <Badge
          key={range.id}
          variant="outline"
          className="flex items-center gap-1 px-2 py-1 bg-fuchsia-500 text-white border-transparent"
        >
          <span className="text-xs">{range.label}</span>
          <button
            onClick={() => onRemoveRatingRange(range.id)}
            className="ml-1 hover:bg-destructive/10 rounded-full p-0.5"
            aria-label={`Remove ${range.label} filter`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
    </div>
  );
}