
import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { initializeMap } from '@/utils/mapUtils';
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
  const [initializedToken, setInitializedToken] = useState<string | null>(null);
  const { toast } = useToast();

  // Initialize map when token is available and hasn't been initialized yet
  useEffect(() => {
    if (!mapContainer.current || !token || isLoadingToken) return;
    
    // Don't reinitialize if we already have a map with the same token
    if (map.current && initializedToken === token) return;

    console.log('Initializing map with token...');

    // Clean up existing map if we have a different token
    if (map.current) {
      map.current.remove();
      map.current = null;
      setMapLoaded(false);
    }

    try {
      map.current = initializeMap(mapContainer.current, token);
      setInitializedToken(token);

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
  }, [token, isLoadingToken, initializedToken]); // Removed onTokenError and toast from dependencies

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
