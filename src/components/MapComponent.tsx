import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Equipment } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from './ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
interface DbEquipment {
  id: string;
  name: string;
  category: string;
  price_per_day: number;
  location_lat: number;
  location_lng: number;
  status: string;
  is_available: boolean;
}

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
}

const MapComponent = ({ activeCategory }: MapComponentProps) => {
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

  // Add React Query hook for equipment data
  const { data: equipment = [], isLoading, error } = useQuery<MapEquipment[], Error>({
    queryKey: ['map-equipment', activeCategory],
    queryFn: async () => {
      try {
        console.log('Fetching equipment with category:', activeCategory);

        // Build query with type safety
        const query = supabase
          .from('equipment')
          .select('id, name, category, price_per_day, location_lat, location_lng, status');

        // Add category filter if specified
        if (activeCategory) {
          console.log('Applying category filter:', activeCategory);
          query.eq('category', activeCategory);
        }

        // Only show available equipment
        console.log('Applying status filter');
        query.eq('status', 'available');

        const { data: equipmentData, error: queryError } = await query;

        if (queryError) {
          console.error('Supabase query error details:', {
            message: queryError.message,
            details: queryError.details,
            hint: queryError.hint,
            code: queryError.code
          });
          throw new Error(`Database error: ${queryError.message}`);
        }

        if (!equipmentData) {
          console.log('No equipment data returned');
          return [];
        }

        console.log('Equipment data fetched:', equipmentData.length, 'items');

        // Validate location data
        const validEquipment = equipmentData.filter(item => {
          const hasLocation = item.location_lat != null && item.location_lng != null;
          if (!hasLocation) {
            console.warn(`Equipment ${item.id} missing location data`);
          }
          return hasLocation;
        });

        // Transform to MapEquipment type
        return validEquipment.map((item: DbEquipment) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          price_per_day: item.price_per_day,
          location: {
            lat: Number(item.location_lat),
            lng: Number(item.location_lng)
          }
        }));
      } catch (error) {
        console.error('Equipment fetch error:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2
  });

  // Show loading state
  useEffect(() => {
    if (isLoading) {
      toast({
        title: "Loading Equipment",
        description: "Fetching available gear in this area...",
      });
    }
  }, [isLoading, toast]);

  // Show error state
  useEffect(() => {
    if (error) {
      toast({
        title: "Error Loading Equipment",
        description: "There was an error loading the equipment. Please try again.",
        variant: "destructive"
      });
    }
  }, [error, toast]);

  // Fetch Mapbox token from Supabase
  useEffect(() => {
    async function fetchMapboxToken() {
      try {
        setIsLoadingToken(true);
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');

        if (error) {
          console.error('Error fetching Mapbox token:', error);
          // Fall back to token input if we can't get the token from Supabase
          if (!token) {
            setShowTokenInput(true);
          }
          return;
        }

        if (data?.token) {
          // Store in localStorage as a fallback
          localStorage.setItem('mapbox_token', data.token);
          setToken(data.token);
          setShowTokenInput(false);
        } else {
          // If no token was returned but we have one in localStorage, keep using it
          if (!token) {
            setShowTokenInput(true);
          }
        }
      } catch (error) {
        console.error('Error in fetching Mapbox token:', error);
        if (!token) {
          setShowTokenInput(true);
        }
      } finally {
        setIsLoadingToken(false);
      }
    }

    if (!token) {
      fetchMapboxToken();
    }
  }, [token]);

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

  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    // Always clear existing markers first
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // If no equipment or empty array, reset map and show message
    if (!Array.isArray(equipment) || equipment.length === 0) {
      map.current.setCenter([-118.2437, 34.0522]);
      map.current.setZoom(11);
      if (activeCategory) {
        toast({
          title: "No Equipment Found",
          description: `No available ${activeCategory} found in this area.`,
        });
      }
      return;
    }

    // Add new markers
    equipment.forEach((item: MapEquipment) => {
      if (!item.location?.lat || !item.location?.lng) {
        console.warn(`Equipment ${item.id} has invalid location data`);
        return;
      }

      const el = document.createElement('div');
      el.className = 'flex items-center justify-center';

      const markerIcon = document.createElement('div');
      markerIcon.className = `p-1 rounded-full ${getCategoryColor(item.category)}`;

      const icon = document.createElement('div');
      icon.className = 'text-white';
      icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;

      markerIcon.appendChild(icon);
      el.appendChild(markerIcon);

      try {
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
          )
          .addTo(map.current!);

        markers.current.push(marker);
      } catch (err) {
        console.error(`Error creating marker for equipment ${item.id}:`, err);
      }
    });

    // Fit bounds if we have markers
    if (markers.current.length > 0) {
      try {
        const bounds = new mapboxgl.LngLatBounds();
        equipment.forEach((item: MapEquipment) => {
          if (item.location?.lat && item.location?.lng) {
            bounds.extend([item.location.lng, item.location.lat]);
          }
        });
        map.current.fitBounds(bounds, { padding: 50, maxZoom: 12 });
      } catch (err) {
        console.error('Error fitting bounds:', err);
      }
    } else {
      // Clear the map and reset to default view of LA when no equipment is found
      markers.current.forEach(marker => marker.remove());
      markers.current = [];
      map.current.setCenter([-118.2437, 34.0522]);
      map.current.setZoom(11);
      // Show a toast to inform the user
      if (activeCategory) {
        toast({
          title: "No Equipment Found",
          description: `No available ${activeCategory} found in this area.`,
        });
      }
    }
  }, [equipment, mapLoaded, activeCategory, toast]);

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
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading map configuration...</span>
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
          {isLoading && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-20">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading gear...</span>
              </div>
            </div>
          )}
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
