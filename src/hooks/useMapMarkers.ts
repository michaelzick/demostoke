
import { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { createMarkerElement, createPopupContent, createUserLocationMarkerElement, createUserLocationPopupContent } from '@/utils/mapUtils';

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

interface UseMapMarkersProps {
  map: mapboxgl.Map | null;
  mapLoaded: boolean;
  equipment?: MapEquipment[];
  userLocations?: UserLocation[];
  isSingleView?: boolean;
}

export const useMapMarkers = ({ map, mapLoaded, equipment = [], userLocations = [], isSingleView = false }: UseMapMarkersProps) => {
  const markers = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!mapLoaded || !map) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add equipment markers
    equipment.forEach((item) => {
      if (!item.location?.lat || !item.location?.lng) {
        console.warn(`Equipment ${item.id} has invalid location data`);
        return;
      }

      try {
        const el = createMarkerElement(item.category);

        const marker = new mapboxgl.Marker(el)
          .setLngLat([item.location.lng, item.location.lat]);

        // Only add popup if not in single view mode
        if (!isSingleView) {
          marker.setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(createPopupContent(item))
          );
        }

        marker.addTo(map);
        markers.current.push(marker);
      } catch (err) {
        console.error(`Error creating marker for equipment ${item.id}:`, err);
      }
    });

    // Add user location markers
    userLocations.forEach((user) => {
      if (!user.location?.lat || !user.location?.lng) {
        console.warn(`User ${user.id} has invalid location data`);
        return;
      }

      try {
        const el = createUserLocationMarkerElement(user.role);

        const marker = new mapboxgl.Marker(el)
          .setLngLat([user.location.lng, user.location.lat]);

        // Only add popup if not in single view mode
        if (!isSingleView) {
          const popupContent = createUserLocationPopupContent({
            id: user.id,
            name: user.name,
            role: user.role,
            address: user.address
          });
          
          marker.setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(popupContent)
          );
        }

        marker.addTo(map);
        markers.current.push(marker);
      } catch (err) {
        console.error(`Error creating marker for user ${user.id}:`, err);
      }
    });

    // Cleanup function
    return () => {
      markers.current.forEach(marker => marker.remove());
      markers.current = [];
    };
  }, [mapLoaded, equipment, userLocations, map, isSingleView]);

  return markers.current;
};
