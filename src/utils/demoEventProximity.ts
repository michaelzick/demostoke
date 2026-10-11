import type { DemoEvent } from "@/types/demo-calendar";
import { calculateDistance, isValidCoordinate } from "@/utils/distanceCalculation";

// Returns events within radiusMiles of the user. When no radius is selected or
// the user's location is not known yet, events pass through unfiltered. Events
// without valid coordinates are excluded once the filter is active.
export const filterDemoEventsByProximity = (
  events: DemoEvent[],
  radiusMiles: number | null,
  userLatitude: number | null,
  userLongitude: number | null,
): DemoEvent[] => {
  if (radiusMiles === null || !isValidCoordinate(userLatitude, userLongitude)) {
    return events;
  }

  return events.filter((event) => {
    if (!isValidCoordinate(event.location_lat, event.location_lng)) return false;
    const distance = calculateDistance(
      userLatitude!,
      userLongitude!,
      event.location_lat!,
      event.location_lng!,
    );
    return distance <= radiusMiles;
  });
};
