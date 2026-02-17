
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
  userRole?: string;
  searchQuery?: string;
  isEquipmentLoading?: boolean;
  interactive?: boolean;
  ownerIds?: string[];
  viewMode?: 'map' | 'list' | 'hybrid';
  filteredUserLocations?: Array<{
    id: string;
    name: string;
    role: string;
    address: string;
    location: { lat: number; lng: number };
    equipment_categories: string[];
  }>;
}

const MapComponent = ({
  activeCategory,
  initialEquipment,
  userRole,
  searchQuery,
  isEquipmentLoading = false,
  interactive = true,
  ownerIds,
  viewMode,
  filteredUserLocations
}: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  
  // Determine which route we're on
  const isSearchRoute = !!useMatch("/search");
  const isExploreRoute = !!useMatch("/explore");
  
  // Determine display mode
  const isEquipmentDetailMode = !isSearchRoute && !isExploreRoute && initialEquipment && initialEquipment.length > 0;
  
  // Only fetch user locations when on explore route
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

    const showCategoryColors = isSearchRoute || viewMode === 'hybrid';

    if (isEquipmentDetailMode) {
      // Equipment detail mode: Show single gear item without popup
      
      const validEquipment = initialEquipment.filter(item => 
        item.location && 
        typeof item.location.lat === 'number' && 
        typeof item.location.lng === 'number'
      );

      validEquipment.forEach((item) => {
        const el = userRole
          ? createUserLocationMarkerElement(userRole, activeCategory || undefined)
          : createMarkerElement(item.category);

        const marker = new mapboxgl.Marker(el)
          .setLngLat([item.location.lng, item.location.lat])
          .addTo(map.current!);
      });

      if (validEquipment.length > 0) {
        fitMapBounds(map.current, validEquipment, validEquipment.length === 1);
      }
    } else if (isSearchRoute) {
      // Search route: Show user location markers based on filtered results
      const locationsToShow = filteredUserLocations || userLocations.filter(user =>
        (!ownerIds || ownerIds.includes(user.id)) &&
        (!activeCategory || user.equipment_categories.includes(activeCategory))
      );

      locationsToShow.forEach((user) => {
        if (!user.location?.lat || !user.location?.lng) return;

        const categoryForMarker =
          activeCategory || (showCategoryColors ? user.equipment_categories[0] : undefined);
        const el = createUserLocationMarkerElement(user.role, categoryForMarker);

        const marker = new mapboxgl.Marker(el)
          .setLngLat([user.location.lng, user.location.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
              createUserLocationPopupContent(user)
            )
          )
          .addTo(map.current!);
      });

      if (locationsToShow.length > 0) {
        fitMapBounds(map.current, locationsToShow);
      }
    } else if (isExploreRoute) {
      // Explore route: Show user location markers

      // Prefer pre-filtered user locations when provided so map markers match list/hybrid results.
      const locationsToShow = filteredUserLocations ?? (
        activeCategory
          ? userLocations.filter(user => user.equipment_categories.includes(activeCategory))
          : userLocations
      );

      locationsToShow.forEach((user) => {
        if (!user.location?.lat || !user.location?.lng) return;

        const categoryForMarker =
          activeCategory || (showCategoryColors ? user.equipment_categories[0] : undefined);
        const el = createUserLocationMarkerElement(user.role, categoryForMarker);
        
        const marker = new mapboxgl.Marker(el)
          .setLngLat([user.location.lng, user.location.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
              createUserLocationPopupContent(user)
            )
          )
          .addTo(map.current!);
      });

      if (locationsToShow.length > 0) {
        fitMapBounds(map.current, locationsToShow);
      }
    }
  }, [isSearchRoute, isExploreRoute, isEquipmentDetailMode, initialEquipment, userLocations, activeCategory, isLoading, ownerIds, viewMode, filteredUserLocations]);

  const showLoading = isLoading || 
    (isSearchRoute ? isEquipmentLoading : (isExploreRoute ? isUserLocationsLoading : false));

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
      <div
        ref={mapContainer}
        className={`w-full h-full${!interactive ? ' pointer-events-none' : ''}`}
      />
      {showLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
};

export default MapComponent;
