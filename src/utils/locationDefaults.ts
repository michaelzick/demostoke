import { isValidCoordinate } from '@/utils/distanceCalculation';

export const LAKE_TAHOE_COORDINATES = { lat: 39.0968, lng: -120.0324 } as const;

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
      lat: LAKE_TAHOE_COORDINATES.lat,
      lng: LAKE_TAHOE_COORDINATES.lng,
      zoom: DEFAULT_EXPLORE_ZOOM,
      isUserLocation: false,
    };
  }

  return null;
}
