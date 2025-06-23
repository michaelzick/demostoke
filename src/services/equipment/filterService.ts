
import { Equipment } from '@/types';

export const filterEquipmentByCategory = (equipment: Equipment[], category: string | null): Equipment[] => {
  if (!category) return equipment;
  
  // Filter out SUPs from any filtering
  const validCategories = ['snowboards', 'skis', 'surfboards', 'mountain-bikes'];
  if (!validCategories.includes(category)) return equipment;
  
  return equipment.filter(item => item.category === category);
};

export const getAvailableCategories = (equipment: Equipment[]): string[] => {
  const categories = new Set(equipment.map(item => item.category));
  
  // Remove SUPs from available categories
  categories.delete('sups');
  
  return Array.from(categories).sort();
};
