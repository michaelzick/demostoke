import { Equipment } from "@/types";

// Helper function to calculate distance between two coordinates
const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const toRadians = (angle: number) => (angle * Math.PI) / 180;

  const lat1Rad = toRadians(lat1);
  const lng1Rad = toRadians(lng1);
  const lat2Rad = toRadians(lat2);
  const lng2Rad = toRadians(lng2);

  const deltaLat = lat2Rad - lat1Rad;
  const deltaLng = lng2Rad - lng1Rad;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) *
    Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;
  return distance;
};

export const filterEquipmentByLocation = (
  equipment: Equipment[],
  userLat?: number,
  userLng?: number,
  maxDistance?: number
): Equipment[] => {
  if (!userLat || !userLng || !maxDistance) {
    return equipment;
  }

  return equipment.filter(item => {
    const distance = calculateDistance(
      userLat,
      userLng,
      item.location.lat,
      item.location.lng
    );
    return distance <= maxDistance;
  });
};

export const filterEquipmentByCategory = (
  equipment: Equipment[],
  category: string | null
): Equipment[] => {
  if (!category) {
    return equipment;
  }

  return equipment.filter(item => item.category === category);
};

export const filterEquipmentByPriceRange = (
  equipment: Equipment[],
  priceRange?: [number, number]
): Equipment[] => {
  if (!priceRange) {
    return equipment;
  }

  const [minPrice, maxPrice] = priceRange;

  return equipment.filter(item => item.price_per_day >= minPrice && item.price_per_day <= maxPrice);
};

export const sortEquipment = (
  equipment: Equipment[],
  sortBy?: string
): Equipment[] => {
  if (!sortBy) {
    return equipment;
  }

  switch (sortBy) {
    case "price-asc":
      return [...equipment].sort((a, b) => a.price_per_day - b.price_per_day);
    case "price-desc":
      return [...equipment].sort((a, b) => b.price_per_day - a.price_per_day);
    case "rating-desc":
      return [...equipment].sort((a, b) => b.rating - a.rating);
    default:
      return equipment;
  }
};

export const searchEquipment = (
  equipment: Equipment[],
  searchTerm: string,
  categoryFilter: string | null,
  userLat?: number,
  userLng?: number,
  maxDistance?: number,
  priceRange?: [number, number],
  sortBy?: string
): Equipment[] => {
  let filtered = equipment;

  // Apply text search
  if (searchTerm.trim()) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(item =>
      item.name.toLowerCase().includes(term) ||
      item.description.toLowerCase().includes(term) ||
      item.category.toLowerCase().includes(term) ||
      item.specifications.suitable.toLowerCase().includes(term) ||
      item.location.address.toLowerCase().includes(term)
    );
  }

  // Apply category filter
  if (categoryFilter) {
    filtered = filterEquipmentByCategory(filtered, categoryFilter);
  }

  // Apply location filter
  if (userLat && userLng && maxDistance) {
    filtered = filterEquipmentByLocation(filtered, userLat, userLng, maxDistance);
  }

  // Apply price range filter
  if (priceRange) {
    filtered = filterEquipmentByPriceRange(filtered, priceRange);
  }

  // Apply sorting
  if (sortBy) {
    filtered = sortEquipment(filtered, sortBy);
  }

  return filtered;
};
