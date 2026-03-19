import type { Equipment } from "@/types";

export interface MapViewportBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

type WithMapLocation = {
  location?: {
    lat?: number;
    lng?: number;
  } | null;
};

const hasValidMapCoordinates = <T extends WithMapLocation>(
  item: T,
): item is T & { location: { lat: number; lng: number } } =>
  typeof item.location?.lat === "number" &&
  Number.isFinite(item.location.lat) &&
  typeof item.location?.lng === "number" &&
  Number.isFinite(item.location.lng);

const isLongitudeWithinBounds = (lng: number, bounds: MapViewportBounds): boolean => {
  if (bounds.west <= bounds.east) {
    return lng >= bounds.west && lng <= bounds.east;
  }

  return lng >= bounds.west || lng <= bounds.east;
};

export const isPointWithinViewportBounds = (
  lat: number,
  lng: number,
  bounds: MapViewportBounds,
): boolean =>
  lat >= bounds.south &&
  lat <= bounds.north &&
  isLongitudeWithinBounds(lng, bounds);

export const filterItemsByViewportBounds = <T extends WithMapLocation>(
  items: T[],
  bounds: MapViewportBounds | null,
): Array<T & { location: { lat: number; lng: number } }> => {
  const mappableItems = items.filter(hasValidMapCoordinates);

  if (!bounds) {
    return mappableItems;
  }

  return mappableItems.filter((item) =>
    isPointWithinViewportBounds(item.location.lat, item.location.lng, bounds),
  );
};

export const filterEquipmentByViewportBounds = (
  equipment: Equipment[],
  bounds: MapViewportBounds | null,
): Equipment[] => {
  return filterItemsByViewportBounds(equipment, bounds);
};
