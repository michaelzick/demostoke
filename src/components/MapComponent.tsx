
import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useToast } from '@/hooks/use-toast';
import { initializeMap, fitMapBounds } from '@/utils/mapUtils';
import { useMapMarkers } from '@/hooks/useMapMarkers';
import MapboxTokenForm from './map/MapboxTokenForm';
import MapLegend from './map/MapLegend';
import { supabase } from '@/integrations/supabase/client';

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

interface MapComponentProps {
  activeCategory: string | null;
  initialEquipment?: MapEquipment[];
  isSingleView?: boolean;
  searchQuery?: string;
}

const MapComponent = ({ activeCategory, initialEquipment, isSingleView = false, searchQuery }: MapComponentProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const { toast } = useToast();

  const [token, setToken] = useState<string | null>(null);
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [isLoadingToken, setIsLoadingToken] = useState(true);
  const [hasShownNoGearToast, setHasShownNoGearToast] = useState(false);

  // Use the custom hook for managing markers
  const displayEquipment = initialEquipment || [];
  useMapMarkers({ map: map.current, mapLoaded, equipment: displayEquipment, isSingleView });

  // Show toast when no gear is found (only once per search/filter change)
  useEffect(() => {
    if (mapLoaded && displayEquipment.length === 0 && !isSingleView) {
      if (!hasShownNoGearToast) {
        toast({
          title: "No gear found",
          description: searchQuery 
            ? `No equipment found matching "${searchQuery}". Try adjusting your search or filters.`
            : activeCategory 
            ? `No equipment found in the ${activeCategory} category. Try a different category or clear filters.`
            : "No equipment found in this area. Try expanding your search area or adjusting filters.",
          variant: "default",
        });
        setHasShownNoGearToast(true);
      }
    } else {
      setHasShownNoGearToast(false);
    }
  }, [mapLoaded, displayEquipment.length, isSingleView, searchQuery, activeCategory, toast, hasShownNoGearToast]);

  // Load token on component mount
  useEffect(() => {
    const loadToken = async () => {
      console.log('Starting token loading process...');
      setIsLoadingToken(true);
      
      // First, check localStorage
      const localToken = localStorage.getItem('mapbox_token');
      if (localToken) {
        console.log('Token found in localStorage');
        setToken(localToken);
        setIsLoadingToken(false);
        return;
      }

      // If no local token, try to fetch from Supabase
      console.log('No local token found, fetching from Supabase...');
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        
        if (error) {
          console.error('Error fetching token from Supabase:', error);
          setShowTokenInput(true);
          setIsLoadingToken(false);
          return;
        }

        if (data?.token) {
          console.log('Token fetched successfully from Supabase');
          setToken(data.token);
          setIsLoadingToken(false);
          return;
        }
      } catch (err) {
        console.error('Failed to fetch token from Supabase:', err);
      }

      // If all else fails, show token input
      console.log('No token available, showing input form');
      setShowTokenInput(true);
      setIsLoadingToken(false);
    };

    loadToken();
  }, []);

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
          toast({
            title: "Invalid Mapbox Token",
            description: "The provided Mapbox token is invalid or expired. Please enter a new token.",
            variant: "destructive"
          });
          setShowTokenInput(true);
          localStorage.removeItem('mapbox_token');
          setToken(null);
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
      setShowTokenInput(true);
      toast({
        title: "Map Error",
        description: "There was an error loading the map. Please check your Mapbox token.",
        variant: "destructive"
      });
    }
  }, [token, toast, isLoadingToken]);

  // Fit bounds when equipment changes
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    fitMapBounds(map.current, displayEquipment, isSingleView);
  }, [mapLoaded, displayEquipment, isSingleView]);

  const handleTokenSubmit = (tokenInput: string) => {
    console.log('Token submitted by user');
    localStorage.setItem('mapbox_token', tokenInput);
    setToken(tokenInput);
    setShowTokenInput(false);
    toast({
      title: "Token Applied",
      description: "Your Mapbox token has been saved. The map will now load.",
    });
  };

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
      {isLoadingToken ? (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="flex items-center justify-center h-full w-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-400" />
          </div>
        </div>
      ) : showTokenInput ? (
        <MapboxTokenForm onTokenSubmit={handleTokenSubmit} isLoading={false} />
      ) : (
        <>
          <MapLegend />
          <div ref={mapContainer} className="w-full h-full" />
        </>
      )}
    </div>
  );
};

export default MapComponent;
