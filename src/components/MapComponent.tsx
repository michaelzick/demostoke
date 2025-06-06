import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from './ui/input';

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

const getCategoryColor = (category: string): string => {
  switch (category.toLowerCase()) {
    case 'snowboards':
      return 'bg-fuchsia-600';
    case 'skis':
      return 'bg-lime-600';
    case 'surfboards':
      return 'bg-blue-600';
    case 'sups':
      return 'bg-violet-600';
    case 'skateboards':
      return 'bg-red-600';
    default:
      return 'bg-black';
  }
};

const MapComponent = ({ activeCategory, initialEquipment, isSingleView = false, searchQuery }: MapComponentProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('mapbox_token');
  });
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [tokenInput, setTokenInput] = useState(token || '');
  const [isLoadingToken, setIsLoadingToken] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;
    if (!token) {
      setIsLoadingToken(true);
      return;
    }

    if (map.current) {
      map.current.remove();
      map.current = null;
    }

    try {
      mapboxgl.accessToken = token;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-118.2437, 34.0522], // Los Angeles coordinates
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

  // Update markers when data or map changes
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Use only initialEquipment (mock data)
    const displayEquipment = initialEquipment || [];

    // Add new markers
    displayEquipment.forEach((item: MapEquipment) => {
      if (!item.location?.lat || !item.location?.lng) {
        console.warn(`Equipment ${item.id} has invalid location data`);
        return;
      }

      try {
        const el = document.createElement('div');
        el.className = 'flex items-center justify-center';

        const markerIcon = document.createElement('div');
        markerIcon.className = `p-1 rounded-full ${getCategoryColor(item.category)}`;

        const icon = document.createElement('div');
        icon.className = 'text-white';
        icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/></svg>';

        markerIcon.appendChild(icon);
        el.appendChild(markerIcon);

        const marker = new mapboxgl.Marker(el)
          .setLngLat([item.location.lng, item.location.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`
                <div>
                  <h3 class="text-sm font-medium">${item.name}</h3>
                  <p class="text-xs text-gray-500">${item.category}</p>
                  <p class="text-xs mt-1">$${item.price_per_day}/day</p>
                  <button
                    class="mt-2 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                    onclick="window.location.href='/equipment/${item.id}'"
                  >
                    View Details
                  </button>
                </div>
              `)
          );

        marker.addTo(map.current!);
        markers.current.push(marker);
      } catch (err) {
        console.error(`Error creating marker for equipment ${item.id}:`, err);
      }
    });

    // Fit bounds if we have markers
    if (markers.current.length > 0) {
      try {
        const bounds = new mapboxgl.LngLatBounds();
        displayEquipment.forEach((item: MapEquipment) => {
          if (item.location?.lat && item.location?.lng) {
            bounds.extend([item.location.lng, item.location.lat]);
          }
        });
        map.current.fitBounds(bounds, { padding: 50, maxZoom: isSingleView ? 15 : 12 });
      } catch (err) {
        console.error('Error fitting bounds:', err);
      }
    } else {
      map.current.setCenter([-118.2437, 34.0522]);
      map.current.setZoom(11);
    }
  }, [mapLoaded, activeCategory, initialEquipment, isSingleView, toast]);

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
      {isLoadingToken && !showTokenInput ? (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="flex items-center justify-center h-full w-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-400" />
          </div>
        </div>
      ) : showTokenInput ? (
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
              <Button type="submit" className="w-full" disabled={isLoadingToken}>
                {isLoadingToken ? "Loading..." : "Apply Token"}
              </Button>
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
                <MapPin className="h-4 w-4 bg-fuchsia-600" />
                <span className="text-xs font-medium">Snowboards</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 bg-lime-600" />
                <span className="text-xs font-medium">Skis</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 bg-blue-600" />
                <span className="text-xs font-medium">Surfboards</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 bg-violet-600" />
                <span className="text-xs font-medium">SUPs</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 bg-red-600" />
                <span className="text-xs font-medium">Skateboards</span>
              </div>
            </div>
          </div>
          <div ref={mapContainer} className="w-full h-full" />
        </>
      )}
    </div>
  );
};

export default MapComponent;
