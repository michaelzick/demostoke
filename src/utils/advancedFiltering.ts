import { Equipment } from "@/types";
import { AdvancedFilters, PRICE_RANGES, RATING_RANGES } from "@/types/advancedFilters";

export function applyAdvancedFilters(
  equipment: Equipment[],
  filters: AdvancedFilters,
  favoriteIds?: string[]
): Equipment[] {
  let results = [...equipment];

  // Apply My Favorites filter first
  if (filters.myFavorites && favoriteIds) {
    results = results.filter(item => favoriteIds.includes(item.id));
  }

  // Apply price range filters
  if (filters.priceRanges.length > 0) {
    results = results.filter(item => {
      return filters.priceRanges.some(rangeId => {
        const range = PRICE_RANGES.find(r => r.id === rangeId);
        if (!range) return false;
        
        const price = item.price_per_day;
        if (range.max) {
          return price >= range.min && price <= range.max;
        } else {
          return price >= range.min; // "More Than $150" case
        }
      });
    });
  }

  // Apply rating filters
  if (filters.ratingRanges.length > 0) {
    results = results.filter(item => {
      // Handle equipment with no rating or 0 rating
      const rating = item.rating || 0;
      if (rating === 0) return false;
      
      return filters.ratingRanges.some(rangeId => {
        const range = RATING_RANGES.find(r => r.id === rangeId);
        if (!range) return false;
        
        return rating >= range.min && rating <= range.max;
      });
    });
  }

  // Apply featured filter
  if (filters.featured) {
    results = results.filter(item => item.is_featured === true);
  }

  return results;
}