import { isValidCoordinate } from '@/utils/distanceCalculation';

// Surf-first fallback: Santa Monica Bay, the center of the SoCal surfboard inventory.
export const DEFAULT_EXPLORE_COORDINATES = { lat: 34.0195, lng: -118.4912 } as const;

export const DEFAULT_EXPLORE_ZOOM = 9;
export const USER_LOCATION_EXPLORE_ZOOM = 10;

export type ExplorePermissionState = 'idle' | 'loading' | 'granted' | 'denied';

export interface ResolvedExploreCenter {
  lat: number;
  lng: number;
  zoom: number;
  isUserLocation: boolean;
}

interface ResolveExploreCenterInput {
  latitude: number | null;
  longitude: number | null;
  permissionState: ExplorePermissionState;
}

export function resolveExploreCenter(
  geo: ResolveExploreCenterInput,
): ResolvedExploreCenter | null {
  if (
    geo.permissionState === 'granted' &&
    isValidCoordinate(geo.latitude, geo.longitude)
  ) {
    return {
      lat: geo.latitude as number,
      lng: geo.longitude as number,
      zoom: USER_LOCATION_EXPLORE_ZOOM,
      isUserLocation: true,
    };
  }

  if (geo.permissionState === 'denied') {
    return {
      lat: DEFAULT_EXPLORE_COORDINATES.lat,
      lng: DEFAULT_EXPLORE_COORDINATES.lng,
      zoom: DEFAULT_EXPLORE_ZOOM,
      isUserLocation: false,
    };
  }

  return null;
}
