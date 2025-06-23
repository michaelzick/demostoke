
import type { Equipment } from '@/types';

interface SearchMatch {
  equipment: Equipment;
  score: number;
}

export const searchEquipment = (
  equipment: Equipment[],
  searchQuery: string
): Equipment[] => {
  if (!searchQuery.trim()) return equipment;

  const query = searchQuery.toLowerCase().trim();
  const searchTerms = query.split(/\s+/);

  // Check for bike-related terms to filter to mountain bikes only
  const bikeTerms = ['bike', 'bicycle', 'mountain', 'trail', 'enduro', 'downhill', 'cross-country', 'xc'];
  const hasBikeTerms = searchTerms.some(term => bikeTerms.includes(term));

  if (hasBikeTerms) {
    equipment = equipment.filter(item => item.category === 'mountain-bikes');
  }

  const matches: SearchMatch[] = [];

  equipment.forEach(item => {
    let score = 0;

    // Check each search term
    searchTerms.forEach(term => {
      // Title matches (highest priority - 10 points)
      if (item.name.toLowerCase().includes(term)) {
        score += 10;
      }

      // Subcategory matches (high priority - 7 points)
      if (item.subcategory?.toLowerCase().includes(term)) {
        score += 7;
      }

      // Description matches (medium priority - 3 points)
      if (item.description?.toLowerCase().includes(term)) {
        score += 3;
      }

      // Category matches (low priority - 1 point)
      if (item.category.toLowerCase().includes(term)) {
        score += 1;
      }
    });

    // Only include items that match at least one search term
    if (score > 0) {
      matches.push({ equipment: item, score });
    }
  });

  // Sort by score (highest first), then by name for consistent ordering
  return matches
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.equipment.name.localeCompare(b.equipment.name);
    })
    .map(match => match.equipment);
};
