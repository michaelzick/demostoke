
import { useMemo } from 'react';
import { useGeolocation } from './useGeolocation';
import { calculateDistance, isValidCoordinate } from '@/utils/distanceCalculation';
import { Equipment } from '@/types';
import { AISearchResult } from '@/services/equipment/aiSearchService';

// Create a union type that can handle both Equipment and AISearchResult
type ProcessableEquipment = Equipment | AISearchResult;

export const useEquipmentWithDynamicDistance = <T extends ProcessableEquipment>(equipment: T[]) => {
  const { latitude, longitude, loading, permissionDenied } = useGeolocation();

  const equipmentWithUpdatedDistances = useMemo(() => {
    // If we're still loading location or permission was denied, return original equipment
    if (loading || permissionDenied || !isValidCoordinate(latitude, longitude)) {
      return equipment;
    }

    // Update equipment items with dynamically calculated distances
    return equipment.map(item => {
      // Check if equipment has valid location
      const hasEquipmentLocation = isValidCoordinate(
        item.location?.lat,
        item.location?.lng
      );

      if (hasEquipmentLocation && latitude && longitude) {
        const dynamicDistance = calculateDistance(
          latitude,
          longitude,
          item.location!.lat!,
          item.location!.lng!
        );

        return {
          ...item,
          distance: dynamicDistance
        };
      }

      // Return original item if no valid location data
      return item;
    });
  }, [equipment, latitude, longitude, loading, permissionDenied]);

  return {
    equipment: equipmentWithUpdatedDistances,
    isLocationBased: !loading && !permissionDenied && isValidCoordinate(latitude, longitude),
    loading
  };
};
