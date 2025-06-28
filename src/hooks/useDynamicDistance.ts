
import { useMemo } from 'react';
import { useGeolocation } from './useGeolocation';
import { calculateDistance, isValidCoordinate } from '@/utils/distanceCalculation';

interface Equipment {
  location?: {
    lat?: number;
    lng?: number;
  };
  distance?: number;
}

interface DynamicDistanceResult {
  distance: number | null;
  loading: boolean;
  error: string | null;
  isLocationBased: boolean;
  permissionDenied: boolean;
}

export const useDynamicDistance = (equipment: Equipment): DynamicDistanceResult => {
  const { latitude, longitude, loading, error, permissionDenied } = useGeolocation();

  const result = useMemo((): DynamicDistanceResult => {
    // Check if user location is available
    const hasUserLocation = isValidCoordinate(latitude, longitude);
    
    // Check if equipment has valid location
    const hasEquipmentLocation = isValidCoordinate(
      equipment.location?.lat,
      equipment.location?.lng
    );

    // If we're still loading, return loading state
    if (loading) {
      return {
        distance: equipment.distance || null,
        loading: true,
        error: null,
        isLocationBased: false,
        permissionDenied: false,
      };
    }

    // If permission was denied, use static distance
    if (permissionDenied) {
      return {
        distance: equipment.distance || null,
        loading: false,
        error: null,
        isLocationBased: false,
        permissionDenied: true,
      };
    }

    // If we have both user and equipment locations, calculate dynamic distance
    if (hasUserLocation && hasEquipmentLocation && latitude && longitude) {
      const calculatedDistance = calculateDistance(
        latitude,
        longitude,
        equipment.location!.lat!,
        equipment.location!.lng!
      );

      return {
        distance: calculatedDistance,
        loading: false,
        error: null,
        isLocationBased: true,
        permissionDenied: false,
      };
    }

    // If there's an error or no location data, fall back to static distance
    return {
      distance: equipment.distance || null,
      loading: false,
      error: error,
      isLocationBased: false,
      permissionDenied: false,
    };
  }, [latitude, longitude, loading, error, permissionDenied, equipment]);

  return result;
};
