
import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { initializeMap, fitMapBounds } from '@/utils/mapUtils';
import { useToast } from '@/hooks/use-toast';

interface MapEquipment {
  id: string;
  name: string;
  category: string;
  price_per_day: number;
  location: {
    lat: number;
    lng: number;
  };
}

interface UserLocation {
  id: string;
  name: string;
  role: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  equipment_categories: string[];
}

interface UseMapInitializationProps {
  token: string | null;
  isLoadingToken: boolean;
  onTokenError: () => void;
  displayEquipment: MapEquipment[];
  displayUserLocations: UserLocation[];
  isSingleView: boolean;
  isUserLocationMode: boolean;
}

export const useMapInitialization = ({
  token,
  isLoadingToken,
  onTokenError,
  displayEquipment,
  displayUserLocations,
  isSingleView,
  isUserLocationMode
}: UseMapInitializationProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const { toast } = useToast();

  // Initialize map when token is available
  useEffect(() => {
    if (!mapContainer.current || !token || isLoadingToken) return;

    console.log('Initializing map with token...');

    if (map.current) {
      map.current.remove();
      map.current = null;
    }

    try {
      map.current = initializeMap(mapContainer.current, token);

      map.current.on('load', () => {
        console.log('Map loaded successfully');
        setMapLoaded(true);
      });

      map.current.on('error', (e: { error: { message: string, code?: number; }; }) => {
        console.error('Map error:', e);
        if (e.error && (e.error.code === 401 || e.error.code === 403)) {
          onTokenError();
        }
      });

      return () => {
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
      };
    } catch (error) {
      console.error('Error initializing map:', error);
      toast({
        title: "Map Error",
        description: "There was an error loading the map. Please check your Mapbox token.",
        variant: "destructive"
      });
    }
  }, [token, isLoadingToken, onTokenError, toast]);

  // Fit bounds when data changes
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    const locations = isUserLocationMode ? displayUserLocations : displayEquipment;
    fitMapBounds(map.current, locations, isSingleView);
  }, [mapLoaded, displayEquipment, displayUserLocations, isSingleView, isUserLocationMode]);

  return {
    mapContainer,
    map: map.current,
    mapLoaded
  };
};
