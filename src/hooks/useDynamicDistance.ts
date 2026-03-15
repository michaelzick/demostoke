
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
  permissionState: 'idle' | 'loading' | 'granted' | 'denied';
  requestLocation: () => void;
}

export const useDynamicDistance = (equipment: Equipment): DynamicDistanceResult => {
  const { latitude, longitude, loading, error, permissionDenied, permissionState, requestLocation } = useGeolocation();

  const result = useMemo((): DynamicDistanceResult => {
    const hasUserLocation = isValidCoordinate(latitude, longitude);
    const hasEquipmentLocation = isValidCoordinate(
      equipment.location?.lat,
      equipment.location?.lng
    );

    if (loading) {
      return {
        distance: equipment.distance || null,
        loading: true,
        error: null,
        isLocationBased: false,
        permissionDenied: false,
        permissionState,
        requestLocation,
      };
    }

    if (permissionDenied) {
      return {
        distance: equipment.distance || null,
        loading: false,
        error: null,
        isLocationBased: false,
        permissionDenied: true,
        permissionState,
        requestLocation,
      };
    }

    if (hasUserLocation && hasEquipmentLocation && latitude !== null && longitude !== null) {
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
        permissionState,
        requestLocation,
      };
    }

    return {
      distance: equipment.distance || null,
      loading: false,
      error: error,
      isLocationBased: false,
      permissionDenied: false,
      permissionState,
      requestLocation,
    };
  }, [latitude, longitude, loading, error, permissionDenied, permissionState, requestLocation, equipment]);

  return result;
};
