
import { useMemo } from 'react';
import { useGeolocation } from './useGeolocation';
import { calculateDistance, isValidCoordinate } from '@/utils/distanceCalculation';
import { Equipment } from '@/types';
import { AISearchResult } from '@/services/equipment/aiSearchService';

// Create a union type that can handle both Equipment and AISearchResult
type ProcessableEquipment = Equipment | AISearchResult;

interface FallbackOrigin {
  lat: number;
  lng: number;
}

export const useEquipmentWithDynamicDistance = <T extends ProcessableEquipment>(
  equipment: T[],
  fallbackOrigin?: FallbackOrigin,
) => {
  const { latitude, longitude, loading, permissionDenied } = useGeolocation();

  const hasUserLocation = !loading && !permissionDenied && isValidCoordinate(latitude, longitude);

  const equipmentWithUpdatedDistances = useMemo(() => {
    if (loading) {
      return equipment;
    }

    let originLat: number | null = null;
    let originLng: number | null = null;

    if (hasUserLocation) {
      originLat = latitude;
      originLng = longitude;
    } else if (fallbackOrigin && isValidCoordinate(fallbackOrigin.lat, fallbackOrigin.lng)) {
      originLat = fallbackOrigin.lat;
      originLng = fallbackOrigin.lng;
    }

    if (originLat === null || originLng === null) {
      return equipment;
    }

    return equipment.map(item => {
      const hasEquipmentLocation = isValidCoordinate(
        item.location?.lat,
        item.location?.lng
      );

      if (hasEquipmentLocation) {
        const dynamicDistance = calculateDistance(
          originLat as number,
          originLng as number,
          item.location!.lat!,
          item.location!.lng!
        );

        return {
          ...item,
          distance: dynamicDistance
        };
      }

      return item;
    });
  }, [equipment, latitude, longitude, loading, hasUserLocation, fallbackOrigin]);

  return {
    equipment: equipmentWithUpdatedDistances,
    isLocationBased: hasUserLocation,
    loading
  };
};
