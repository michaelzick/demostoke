import { useMemo } from 'react';
import { calculateDistance, isValidCoordinate } from '@/utils/distanceCalculation';
import { DemoEvent } from '@/types/demo-calendar';

export const useEventDistance = (
  event: DemoEvent,
  userLat: number | null,
  userLng: number | null
): number | null => {
  return useMemo(() => {
    // Return null if missing any coordinates
    if (!isValidCoordinate(userLat, userLng) || 
        !isValidCoordinate(event.location_lat, event.location_lng)) {
      return null;
    }

    // Calculate distance if all coordinates available
    return calculateDistance(
      userLat!,
      userLng!,
      event.location_lat!,
      event.location_lng!
    );
  }, [event.location_lat, event.location_lng, userLat, userLng]);
};
