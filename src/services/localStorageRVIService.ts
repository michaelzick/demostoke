import { safeLocalStorage } from "@/utils/ssrSafe";

interface RecentlyViewedItem {
  equipment_id: string;
  viewed_at: string;
}

const STORAGE_KEY = 'recently_viewed_equipment';
const MAX_ITEMS = 10;

/**
 * Get recently viewed items from localStorage
 */
export const getLocalRVI = (): RecentlyViewedItem[] => {
  const stored = safeLocalStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

/**
 * Add an item to localStorage RVI
 */
export const addLocalRVI = (equipmentId: string): void => {
  const current = getLocalRVI();
  
  // Remove existing entry (deduplication)
  const filtered = current.filter(item => item.equipment_id !== equipmentId);
  
  // Add new entry at beginning
  const updated: RecentlyViewedItem[] = [
    {
      equipment_id: equipmentId,
      viewed_at: new Date().toISOString()
    },
    ...filtered
  ].slice(0, MAX_ITEMS);
  
  safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

/**
 * Clear localStorage RVI
 */
export const clearLocalRVI = (): void => {
  safeLocalStorage.removeItem(STORAGE_KEY);
};

/**
 * Merge localStorage RVI with database RVI
 * Local items take precedence for duplicates
 */
export const mergeRVIArrays = (
  localItems: RecentlyViewedItem[],
  dbItems: RecentlyViewedItem[]
): RecentlyViewedItem[] => {
  // Create map to deduplicate (most recent viewed_at wins)
  const itemMap = new Map<string, RecentlyViewedItem>();
  
  // Add DB items first
  dbItems.forEach(item => {
    itemMap.set(item.equipment_id, item);
  });
  
  // Add local items (override DB if duplicate)
  localItems.forEach(item => {
    const existing = itemMap.get(item.equipment_id);
    if (!existing || new Date(item.viewed_at) > new Date(existing.viewed_at)) {
      itemMap.set(item.equipment_id, item);
    }
  });
  
  // Convert back to array, sort by viewed_at, limit to MAX_ITEMS
  return Array.from(itemMap.values())
    .sort((a, b) => new Date(b.viewed_at).getTime() - new Date(a.viewed_at).getTime())
    .slice(0, MAX_ITEMS);
};
