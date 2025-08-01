export interface PriceRange {
  id: string;
  label: string;
  min: number;
  max?: number;
}

export interface RatingRange {
  id: string;
  label: string;
  min: number;
  max: number;
}

export interface AdvancedFilters {
  priceRanges: string[];
  ratingRanges: string[];
  featured: boolean;
}

export const PRICE_RANGES: PriceRange[] = [
  { id: 'under-25', label: 'Less Than $25', min: 0, max: 24.99 },
  { id: '25-100', label: '$25-$100', min: 25, max: 100 },
  { id: '100-150', label: '$100-$150', min: 100, max: 150 },
  { id: 'over-150', label: 'More Than $150', min: 150 }
];

export const RATING_RANGES: RatingRange[] = [
  { id: '1-star', label: '1 Star', min: 1, max: 1.99 },
  { id: '2-star', label: '2 Stars', min: 2, max: 2.99 },
  { id: '3-star', label: '3 Stars', min: 3, max: 3.99 },
  { id: '4-star', label: '4 Stars', min: 4, max: 4.99 },
  { id: '5-star', label: '5 Stars', min: 5, max: 5 }
];