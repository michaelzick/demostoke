
import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { initializeMap, fitMapBounds } from '@/utils/mapUtils';
import { useToast } from '@/hooks/use-toast';

interface UseMapInitializationProps {
  token: string | null;
  isLoadingToken: boolean;
  onTokenError: () => void;
}

export const useMapInitialization = ({
  token,
  isLoadingToken,
  onTokenError
}: UseMapInitializationProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const { toast } = useToast();

  // Initialize map when token is available
  useEffect(() => {
    if (!mapContainer.current || !token || isLoadingToken) return;

    console.log('Initializing map with token...');

    // Only remove existing map if we have a new token
    if (map.current) {
      map.current.remove();
      map.current = null;
      setMapLoaded(false);
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

    } catch (error) {
      console.error('Error initializing map:', error);
      toast({
        title: "Map Error",
        description: "There was an error loading the map. Please check your Mapbox token.",
        variant: "destructive"
      });
    }
  }, [token, isLoadingToken, onTokenError, toast]);

  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  return {
    mapContainer,
    map: map.current,
    mapLoaded
  };
};
