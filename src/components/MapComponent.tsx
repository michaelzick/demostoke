
import { useEffect, useRef, useState } from "react";
import { useMatch } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { supabase } from "@/integrations/supabase/client";
import LoadingSpinner from "./LoadingSpinner";
import { useUserLocations } from "@/hooks/useUserLocations";
import {
  initializeMap,
  fitMapBounds,
  createMarkerElement,
  createPopupContent,
  createUserLocationMarkerElement,
  createUserLocationPopupContent,
} from "@/utils/mapUtils";

interface MapProps {
  activeCategory?: string | null;
  initialEquipment?: Array<{
    id: string;
    name: string;
    category: string;
    price_per_day: number;
    location: { lat: number; lng: number };
    ownerId: string;
    ownerName: string;
  }>;
  searchQuery?: string;
  isEquipmentLoading?: boolean;
}

const MapComponent = ({ 
  activeCategory, 
  initialEquipment, 
  searchQuery,
  isEquipmentLoading = false
}: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  
  // Determine if we're on the search route
  const isSearchRoute = !!useMatch("/search");
  
  // Only fetch user locations when NOT on search route
  const { 
    data: userLocations = [], 
    isLoading: isUserLocationsLoading 
  } = useUserLocations();

  // Fetch Mapbox token
  useEffect(() => {
    const fetchMapboxToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (error) throw error;
        setMapboxToken(data.token);
      } catch (err) {
        console.error('Error fetching Mapbox token:', err);
        setError('Failed to load map configuration');
      }
    };

    fetchMapboxToken();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    try {
      map.current = initializeMap(mapContainer.current, mapboxToken);
      map.current.on('load', () => {
        setIsLoading(false);
      });
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize map');
      setIsLoading(false);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken]);

  // Update markers based on route and data
  useEffect(() => {
    if (!map.current || isLoading) return;

    // Clear existing markers
    const existingMarkers = document.querySelectorAll('.mapboxgl-marker');
    existingMarkers.forEach(marker => marker.remove());

    if (isSearchRoute && initialEquipment) {
      // Search route: Show individual gear items
      console.log('🗺️ Search route: Showing gear item markers');
      
      const validEquipment = initialEquipment.filter(item => 
        item.location && 
        typeof item.location.lat === 'number' && 
        typeof item.location.lng === 'number'
      );

      validEquipment.forEach((item) => {
        const el = createMarkerElement(item.category);
        
        const marker = new mapboxgl.Marker(el)
          .setLngLat([item.location.lng, item.location.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
              createPopupContent(item)
            )
          )
          .addTo(map.current!);
      });

      if (validEquipment.length > 0) {
        fitMapBounds(map.current, validEquipment, validEquipment.length === 1);
      }
    } else {
      // Explore route: Show user location markers
      console.log('🗺️ Explore route: Showing user location markers');
      
      // Filter user locations by category if specified
      const filteredUserLocations = activeCategory 
        ? userLocations.filter(user => 
            user.equipment_categories.includes(activeCategory)
          )
        : userLocations;

      filteredUserLocations.forEach((user) => {
        if (!user.location?.lat || !user.location?.lng) return;

        const el = createUserLocationMarkerElement(user.role, activeCategory);
        
        const marker = new mapboxgl.Marker(el)
          .setLngLat([user.location.lng, user.location.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
              createUserLocationPopupContent(user)
            )
          )
          .addTo(map.current!);
      });

      if (filteredUserLocations.length > 0) {
        fitMapBounds(map.current, filteredUserLocations);
      }
    }
  }, [isSearchRoute, initialEquipment, userLocations, activeCategory, isLoading]);

  const showLoading = isLoading || 
    (isSearchRoute ? isEquipmentLoading : isUserLocationsLoading);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading map</p>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      {showLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
};

export default MapComponent;
