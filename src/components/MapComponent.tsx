
import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Equipment } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from './ui/input';

// This is a placeholder token - users will need to provide their own valid token
const MAPBOX_TOKEN = '';

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
  
  // Store token in localStorage to persist between sessions
  const [token, setToken] = useState<string>(() => {
    return localStorage.getItem('mapbox_token') || MAPBOX_TOKEN;
  });
  const [showTokenInput, setShowTokenInput] = useState(!token);
  const [tokenInput, setTokenInput] = useState(token);
  
  // Initialize map with token
  useEffect(() => {
    if (!mapContainer.current || !token) return;
    
    // Clear existing map if any
    if (map.current) {
      map.current.remove();
      map.current = null;
    }

    try {
      mapboxgl.accessToken = token;
      
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

      // Handle map loading errors
      map.current.on('error', (e) => {
        console.error('Map error:', e);
        if (e.error && (e.error.status === 401 || e.error.status === 403)) {
          toast({
            title: "Invalid Mapbox Token",
            description: "The provided Mapbox token is invalid or expired. Please enter a new token.",
            variant: "destructive"
          });
          setShowTokenInput(true);
          localStorage.removeItem('mapbox_token');
          setToken('');
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
  }, [token, toast]);

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

  // Handle token submission
  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tokenInput && tokenInput.startsWith('pk.')) {
      localStorage.setItem('mapbox_token', tokenInput);
      setToken(tokenInput);
      setShowTokenInput(false);
      toast({
        title: "Token Applied",
        description: "Your Mapbox token has been saved. The map will now load.",
      });
    } else {
      toast({
        title: "Invalid Token Format",
        description: "Please enter a valid Mapbox public token starting with 'pk.'",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
      {showTokenInput ? (
        <div className="absolute inset-0 bg-background flex items-center justify-center p-4 z-10">
          <form onSubmit={handleTokenSubmit} className="w-full max-w-md space-y-4 p-6 bg-card rounded-lg shadow-lg">
            <h3 className="text-lg font-medium">Enter Mapbox Token</h3>
            <p className="text-sm text-muted-foreground">
              You need to provide a Mapbox public token to display the map. Get a free token at <a href="https://www.mapbox.com/signin/" target="_blank" rel="noopener noreferrer" className="text-primary underline">mapbox.com</a>.
            </p>
            <Input
              id="mapbox-token"
              type="text"
              placeholder="pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGV4..."
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              className="w-full"
              required
            />
            <div className="space-y-2">
              <Button type="submit" className="w-full">Apply Token</Button>
              <p className="text-xs text-muted-foreground">
                Your token is stored locally in your browser and is never sent to our servers.
              </p>
            </div>
          </form>
        </div>
      ) : (
        <>
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
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs mt-2" 
                onClick={() => setShowTokenInput(true)}
              >
                Change Mapbox Token
              </Button>
            </div>
          </div>
          <div ref={mapContainer} className="w-full h-full" />
        </>
      )}
    </div>
  );
};

export default MapComponent;
