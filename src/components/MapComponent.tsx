
import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Equipment } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Replace with your actual Mapbox token or a temporary input field
const MAPBOX_TOKEN = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbHV6M2N6b2kwNzF2MmpvOTU4ZGdrejE2In0.h8HqM2V5iGtc_Bt3PSHjSQ';

interface MapComponentProps {
  equipment: Equipment[];
  activeCategory: string | null;
}

const MapComponent = ({ equipment, activeCategory }: MapComponentProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Track custom token if needed
  const [customToken, setCustomToken] = useState<string | null>(null);
  const [showTokenInput, setShowTokenInput] = useState(false);
  
  const effectiveToken = customToken || MAPBOX_TOKEN;

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    try {
      mapboxgl.accessToken = effectiveToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-122.4194, 37.7749], // San Francisco by default
        zoom: 11
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      map.current.addControl(new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true
      }));

      map.current.on('load', () => {
        setMapLoaded(true);
      });

      return () => {
        map.current?.remove();
      };
    } catch (error) {
      console.error('Error initializing map:', error);
      setShowTokenInput(true);
      toast({
        title: "Map Error",
        description: "There was an error loading the map. Please check the console for details.",
        variant: "destructive"
      });
    }
  }, [effectiveToken, toast]);

  // Add markers when map is loaded and equipment data changes
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Filter equipment by active category if needed
    const filteredEquipment = activeCategory 
      ? equipment.filter(item => item.category === activeCategory)
      : equipment;

    // Add markers for filtered equipment
    filteredEquipment.forEach(item => {
      // Create a custom marker element
      const el = document.createElement('div');
      el.className = 'flex items-center justify-center';
      
      const markerIcon = document.createElement('div');
      markerIcon.className = `p-1 rounded-full ${getCategoryColor(item.category)}`;
      
      const icon = document.createElement('div');
      icon.className = 'text-white';
      icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;
      
      markerIcon.appendChild(icon);
      el.appendChild(markerIcon);
      
      // Create a mapbox marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat([item.location.lng, item.location.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div>
                <h3 class="text-sm font-medium">${item.name}</h3>
                <p class="text-xs text-gray-500">${item.category}</p>
                <p class="text-xs mt-1">$${item.pricePerDay}/day</p>
                <button 
                  class="mt-2 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                  onclick="window.location.href='/equipment/${item.id}'"
                >
                  View Details
                </button>
              </div>
            `)
        )
        .addTo(map.current!);
      
      markers.current.push(marker);
    });

    // Fit the map to show all markers
    if (markers.current.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      filteredEquipment.forEach(item => {
        bounds.extend([item.location.lng, item.location.lat]);
      });
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 12 });
    }
  }, [equipment, activeCategory, mapLoaded]);

  // Helper function to get color based on category
  const getCategoryColor = (category: string): string => {
    switch (category.toLowerCase()) {
      case 'surfboard':
        return 'bg-ocean-DEFAULT';
      case 'paddle':
        return 'bg-ocean-deep';
      case 'snowboard':
        return 'bg-mountain-DEFAULT';
      default:
        return 'bg-primary';
    }
  };

  // Handle custom token input
  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = document.getElementById('mapbox-token') as HTMLInputElement;
    if (input.value) {
      setCustomToken(input.value);
      setShowTokenInput(false);
      
      // Remove the existing map if any
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    }
  };

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
      {showTokenInput ? (
        <div className="absolute inset-0 bg-background flex items-center justify-center p-4 z-10">
          <form onSubmit={handleTokenSubmit} className="w-full max-w-md space-y-4 p-6 bg-card rounded-lg shadow-lg">
            <h3 className="text-lg font-medium">Enter Mapbox Token</h3>
            <p className="text-sm text-muted-foreground">
              Please provide your Mapbox public token to display the map. You can get one for free at mapbox.com.
            </p>
            <input
              id="mapbox-token"
              type="text"
              placeholder="pk.eyJ1IjoieW91..."
              className="w-full px-3 py-2 border rounded-md"
              required
            />
            <Button type="submit">Submit Token</Button>
          </form>
        </div>
      ) : (
        <div className="absolute top-4 left-4 z-10 bg-background/90 p-2 rounded-md backdrop-blur-sm">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-ocean-DEFAULT" />
              <span className="text-xs font-medium">Surfboards</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-ocean-deep" />
              <span className="text-xs font-medium">Paddles</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-mountain-DEFAULT" />
              <span className="text-xs font-medium">Snowboards</span>
            </div>
          </div>
        </div>
      )}
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};

export default MapComponent;
