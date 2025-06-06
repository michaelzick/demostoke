
import { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { createMarkerElement, createPopupContent } from '@/utils/mapUtils';

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

interface UseMapMarkersProps {
  map: mapboxgl.Map | null;
  mapLoaded: boolean;
  equipment: MapEquipment[];
}

export const useMapMarkers = ({ map, mapLoaded, equipment }: UseMapMarkersProps) => {
  const markers = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!mapLoaded || !map) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add new markers
    equipment.forEach((item) => {
      if (!item.location?.lat || !item.location?.lng) {
        console.warn(`Equipment ${item.id} has invalid location data`);
        return;
      }

      try {
        const el = createMarkerElement(item.category);

        const marker = new mapboxgl.Marker(el)
          .setLngLat([item.location.lng, item.location.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(createPopupContent(item))
          );

        marker.addTo(map);
        markers.current.push(marker);
      } catch (err) {
        console.error(`Error creating marker for equipment ${item.id}:`, err);
      }
    });

    // Cleanup function
    return () => {
      markers.current.forEach(marker => marker.remove());
      markers.current = [];
    };
  }, [mapLoaded, equipment, map]);

  return markers.current;
};
