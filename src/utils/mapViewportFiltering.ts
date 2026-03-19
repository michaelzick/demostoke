import type { Equipment } from "@/types";

export interface MapViewportBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

const hasValidMapCoordinates = (equipment: Equipment): boolean =>
  typeof equipment.location?.lat === "number" &&
  Number.isFinite(equipment.location.lat) &&
  typeof equipment.location?.lng === "number" &&
  Number.isFinite(equipment.location.lng);

const isLongitudeWithinBounds = (lng: number, bounds: MapViewportBounds): boolean => {
  if (bounds.west <= bounds.east) {
    return lng >= bounds.west && lng <= bounds.east;
  }

  return lng >= bounds.west || lng <= bounds.east;
};

export const filterEquipmentByViewportBounds = (
  equipment: Equipment[],
  bounds: MapViewportBounds | null,
): Equipment[] => {
  const mappableEquipment = equipment.filter(hasValidMapCoordinates);

  if (!bounds) {
    return mappableEquipment;
  }

  return mappableEquipment.filter((item) => {
    const { lat, lng } = item.location;

    return (
      lat >= bounds.south &&
      lat <= bounds.north &&
      isLongitudeWithinBounds(lng, bounds)
    );
  });
};
