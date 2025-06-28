
import { useRef, useEffect, useState, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useToast } from '@/hooks/use-toast';
import { initializeMap, fitMapBounds } from '@/utils/mapUtils';
import { useMapMarkers } from '@/hooks/useMapMarkers';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useUserLocations } from '@/hooks/useUserLocations';
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
  ownerId: string;
  ownerName: string;
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

interface MapComponentProps {
  activeCategory: string | null;
  initialEquipment?: MapEquipment[];
  userLocations?: UserLocation[];
  isSingleView?: boolean;
  searchQuery?: string;
  userLocation?: { lat: number; lng: number } | null;
}

const MapComponent = ({ 
  activeCategory, 
  initialEquipment, 
  userLocations: propUserLocations, 
  isSingleView = false, 
  searchQuery,
  userLocation 
}: MapComponentProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const { toast } = useToast();

  const [token, setToken] = useState<string | null>(null);
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [isLoadingToken, setIsLoadingToken] = useState(true);
  const [hasShownNoGearToast, setHasShownNoGearToast] = useState(false);

  // Get app settings to determine display mode
  const { data: appSettings } = useAppSettings();
  const isUserLocationMode = appSettings?.map_display_mode === 'user_locations';

  const { data: fetchedUserLocations = [], isLoading: userLocationsLoading } = useUserLocations();

  const userLocations = propUserLocations || fetchedUserLocations;

  // Memoize filtered user locations to prevent unnecessary re-renders
  const filteredUserLocations = useMemo(() => {
    return isUserLocationMode && activeCategory 
      ? userLocations.filter(user => 
          user.equipment_categories.includes(activeCategory)
        )
      : userLocations;
  }, [isUserLocationMode, activeCategory, userLocations]);

  // Memoize display data to prevent unnecessary re-renders
  const displayEquipment = useMemo(() => {
    return isUserLocationMode ? [] : (initialEquipment || []);
  }, [isUserLocationMode, initialEquipment]);

  const displayUserLocations = useMemo(() => {
    return isUserLocationMode ? filteredUserLocations : [];
  }, [isUserLocationMode, filteredUserLocations]);

  useEffect(() => {
    console.log('🔍 Map display mode:', appSettings?.map_display_mode);
    console.log('👥 Is user location mode:', isUserLocationMode);
    console.log('📍 User locations count:', userLocations.length);
    console.log('⚙️ Equipment count:', initialEquipment?.length || 0);
    console.log('🏷️ Active category:', activeCategory);
    console.log('🌍 User location from URL:', userLocation);
  }, [appSettings, isUserLocationMode, userLocations.length, initialEquipment?.length, activeCategory, userLocation]);

  useMapMarkers({ 
    map: map.current, 
    mapLoaded, 
    equipment: displayEquipment, 
    userLocations: displayUserLocations,
    isSingleView,
    activeCategory 
  });

  // Show toast when no data is found - Fixed dependencies to prevent infinite loop
  useEffect(() => {
    if (!mapLoaded || isSingleView || userLocationsLoading) return;

    const hasDataToShow = isUserLocationMode 
      ? displayUserLocations.length > 0 
      : displayEquipment.length > 0;

    console.log('🔍 Toast check - isUserLocationMode:', isUserLocationMode);
    console.log('🔍 Toast check - hasDataToShow:', hasDataToShow); 
    console.log('🔍 Toast check - userLocationsLoading:', userLocationsLoading);
    console.log('🔍 Toast check - hasShownNoGearToast:', hasShownNoGearToast);

    if (!hasDataToShow) {
      if (!hasShownNoGearToast) {
        const message = isUserLocationMode
          ? activeCategory
            ? `No users found with ${activeCategory} in their inventory. Try selecting a different category or clearing filters.`
            : "No user locations found. Users need to add addresses to their profiles to appear on the map."
          : searchQuery
          ? `No equipment found matching "${searchQuery}". Try adjusting your search or filters.`
          : activeCategory
          ? `No equipment found in the ${activeCategory} category. Try a different category or clear filters.`
          : "No equipment found in this area. Try expanding your search area or adjusting filters.";

        toast({
          title: isUserLocationMode ? "No user locations found" : "No gear found",
          description: message,
          variant: "default",
        });
        setHasShownNoGearToast(true);
      }
    } else {
      setHasShownNoGearToast(false);
    }
  }, [
    mapLoaded, 
    displayEquipment.length, 
    displayUserLocations.length, 
    userLocationsLoading, 
    isSingleView, 
    searchQuery, 
    activeCategory, 
    isUserLocationMode,
    hasShownNoGearToast
    // Removed toast from dependencies to prevent infinite loop
  ]);

  useEffect(() => {
    const loadToken = async () => {
      console.log('🔄 Starting token loading process...');
      setIsLoadingToken(true);

      const localToken = localStorage.getItem('mapbox_token');
      if (localToken && localToken.startsWith('pk.')) {
        console.log('✅ Valid token found in localStorage');
        setToken(localToken);
        setIsLoadingToken(false);
        return;
      }

      console.log('🌐 Fetching token from Supabase Edge Function...');
      try {
        console.log('📡 Calling get-mapbox-token function...');
        
        const { data, error } = await supabase.functions.invoke('get-mapbox-token', {
          method: 'GET'
        });
        
        console.log('📡 Function response received');
        console.log('📊 Response data:', data);
        console.log('❌ Response error:', error);
        
        if (error) {
          console.error('❌ Error from Edge Function:', error);
          throw error;
        }

        if (data && data.token && data.token.startsWith('pk.')) {
          console.log('✅ Valid token received from Supabase');
          setToken(data.token);
          localStorage.setItem('mapbox_token', data.token);
          setIsLoadingToken(false);
          return;
        } else {
          console.error('❌ Invalid or missing token in response');
          throw new Error('Invalid token received');
        }
      } catch (err) {
        console.error('❌ Exception while fetching token from Supabase:', err);
        
        console.log('🔄 Trying fallback to environment variable...');
        const envToken = import.meta.env.VITE_MAPBOX_TOKEN;
        
        if (envToken && envToken.startsWith('pk.')) {
          console.log('✅ Valid token found in environment variable');
          setToken(envToken);
          localStorage.setItem('mapbox_token', envToken);
          setIsLoadingToken(false);
          return;
        } else {
          console.error('❌ No valid token found in environment variable either');
          console.log('📝 Showing token input form');
          setShowTokenInput(true);
          setIsLoadingToken(false);
        }
      }
    };

    loadToken();
  }, []);

  // Initialize map with user location or fallback to Los Angeles
  useEffect(() => {
    if (!mapContainer.current || !token || isLoadingToken) return;

    console.log('Initializing map with token...');

    if (map.current) {
      map.current.remove();
      map.current = null;
    }

    try {
      // Use user location if available, otherwise default to Los Angeles
      const centerCoords = userLocation ? [userLocation.lng, userLocation.lat] : [-118.2437, 34.0522];
      // Use wider zoom (10) when user location is provided to show more area
      const zoomLevel = userLocation ? 10 : 11;

      map.current = initializeMap(mapContainer.current, token, centerCoords as [number, number], zoomLevel);

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
  }, [token, isLoadingToken, userLocation]);

  // Enhanced bounds fitting for user location scenarios
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    const locations = isUserLocationMode ? displayUserLocations : displayEquipment;
    
    // When user location is provided, include it in bounds calculation
    if (userLocation && locations.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      
      // Add user location to bounds
      bounds.extend([userLocation.lng, userLocation.lat]);
      
      // Add all equipment/user locations to bounds
      locations.forEach(item => {
        if (item.location?.lat && item.location?.lng) {
          bounds.extend([item.location.lng, item.location.lat]);
        }
      });
      
      // Fit bounds with appropriate padding and max zoom
      map.current.fitBounds(bounds, { 
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        maxZoom: 12 // Prevent zooming in too close
      });
    } else if (!userLocation) {
      // Use original bounds fitting when no user location
      fitMapBounds(map.current, locations, isSingleView);
    }
  }, [mapLoaded, displayEquipment, displayUserLocations, isSingleView, isUserLocationMode, userLocation]);

  const handleTokenSubmit = (tokenInput: string) => {
    console.log('📝 Token submitted by user');
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
          <MapLegend activeCategory={activeCategory} />
          <div ref={mapContainer} className="w-full h-full" />
          {isUserLocationMode && userLocationsLoading && (
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md">
              <div className="flex items-center gap-2 text-sm">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-400" />
                Loading user locations...
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MapComponent;
