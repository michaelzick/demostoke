import { safeLocalStorage } from "@/utils/ssrSafe";

export interface FavoriteItem {
  equipment_id: string;
  favorited_at: string;
}

const STORAGE_KEY = 'favorite_equipment';

export const getLocalFavorites = (): FavoriteItem[] => {
  const stored = safeLocalStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const addLocalFavorite = (equipmentId: string): void => {
  const current = getLocalFavorites();
  
  // Check if already favorited
  if (current.some(item => item.equipment_id === equipmentId)) {
    return;
  }
  
  // Add new entry at beginning
  const updated: FavoriteItem[] = [
    {
      equipment_id: equipmentId,
      favorited_at: new Date().toISOString()
    },
    ...current
  ];
  
  safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const removeLocalFavorite = (equipmentId: string): void => {
  const current = getLocalFavorites();
  const filtered = current.filter(item => item.equipment_id !== equipmentId);
  safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

export const isLocalFavorite = (equipmentId: string): boolean => {
  const current = getLocalFavorites();
  return current.some(item => item.equipment_id === equipmentId);
};

export const clearLocalFavorites = (): void => {
  safeLocalStorage.removeItem(STORAGE_KEY);
};

export const mergeFavoritesArrays = (
  localItems: FavoriteItem[],
  dbItems: FavoriteItem[]
): FavoriteItem[] => {
  const itemMap = new Map<string, FavoriteItem>();
  
  // Add DB items first
  dbItems.forEach(item => {
    itemMap.set(item.equipment_id, item);
  });
  
  // Add local items (override DB if duplicate with more recent timestamp)
  localItems.forEach(item => {
    const existing = itemMap.get(item.equipment_id);
    if (!existing || new Date(item.favorited_at) > new Date(existing.favorited_at)) {
      itemMap.set(item.equipment_id, item);
    }
  });
  
  // Return sorted by favorited_at (most recent first)
  return Array.from(itemMap.values())
    .sort((a, b) => new Date(b.favorited_at).getTime() - new Date(a.favorited_at).getTime());
};
