import { useState, useRef, useEffect } from "react";
import { Equipment } from "@/types";
import CompactEquipmentCard from "./CompactEquipmentCard";
import MapLegend from "./map/MapLegend";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMapMarkers } from "@/hooks/useMapMarkers";
import mapboxgl from "mapbox-gl";
import { supabase } from "@/integrations/supabase/client";
import { initializeMap, fitMapBounds } from "@/utils/mapUtils";
import { UserLocation } from "@/hooks/useUserLocations";

interface HybridViewProps {
  filteredEquipment: Equipment[];
  activeCategory: string | null;
  isLocationBased: boolean;
  userLocations?: UserLocation[];
  viewMode?: 'map' | 'list' | 'hybrid';
  resetSignal?: number;
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
  ownerId: string;
  ownerName: string;
}

const HybridView = ({ filteredEquipment, activeCategory, isLocationBased, userLocations = [], viewMode = 'hybrid', resetSignal }: HybridViewProps) => {
  const isMobile = useIsMobile();
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Convert equipment to map format
  const mapEquipment: MapEquipment[] = filteredEquipment
    .filter(item => item.location?.lat && item.location?.lng)
    .map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      price_per_day: item.price_per_day,
      location: {
        lat: item.location.lat,
        lng: item.location.lng,
      },
      ownerId: item.owner.id,
      ownerName: item.owner.name,
    }));

  const mapUserLocations = userLocations.filter(user => user.location?.lat && user.location?.lng);

  // Fetch Mapbox token
  useEffect(() => {
    const fetchMapboxToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (error) throw error;
        setMapboxToken(data.token);
      } catch (err) {
        console.error('Error fetching Mapbox token:', err);
      }
    };

    fetchMapboxToken();
  }, []);

  // Initialize or reinitialize the map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    if (map.current) {
      map.current.remove();
      map.current = null;
    }

    setIsMapLoaded(false);

    try {
      map.current = initializeMap(mapContainer.current, mapboxToken);
      map.current.on('load', () => {
        setIsMapLoaded(true);
      });
    } catch (err) {
      console.error('Error initializing map:', err);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken, isMobile]);

  const selectedEquipment = selectedEquipmentId
    ? mapEquipment.find(item => item.id === selectedEquipmentId)
    : undefined;

  // Add markers with click handlers
  const markers = useMapMarkers({
    map: map.current,
    mapLoaded: isMapLoaded,
    equipment: selectedEquipment ? [selectedEquipment] : [],
    userLocations: selectedEquipment ? [] : mapUserLocations,
    isSingleView: false,
    activeCategory,
  });

  // Reset view when resetSignal changes
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;
    setSelectedEquipmentId(null);
    if (mapUserLocations.length > 0) {
      fitMapBounds(map.current, mapUserLocations);
    }
  }, [resetSignal]);

  // Fit bounds when equipment or user locations change
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;

    if (selectedEquipmentId) {
      const equipment = mapEquipment.find(e => e.id === selectedEquipmentId);
      if (equipment) {
        fitMapBounds(map.current, [equipment], true);
      }
    } else if (mapUserLocations.length > 0) {
      fitMapBounds(map.current, mapUserLocations);
    }
  }, [mapEquipment, mapUserLocations, isMapLoaded, selectedEquipmentId]);

  const handleEquipmentCardClick = (equipmentId: string) => {
    setSelectedEquipmentId(equipmentId);
    
    const equipment = mapEquipment.find(item => item.id === equipmentId);
    if (equipment && map.current) {
      // Center map on equipment location
      map.current.flyTo({
        center: [equipment.location.lng, equipment.location.lat],
        zoom: 15,
        duration: 1000
      });

      if (isMobile) {
        // Scroll to top to show the map
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleMapPinClick = (equipmentId: string) => {
    setSelectedEquipmentId(equipmentId);
    
    if (isMobile) {
      // Scroll to the equipment card in the list
      const cardElement = document.getElementById(`equipment-card-${equipmentId}`);
      if (cardElement) {
        cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const handleCardWrapperClick = (e: React.MouseEvent, equipmentId: string) => {
    // Don't trigger if clicking on links or buttons
    const target = e.target as HTMLElement;
    if (target.tagName === 'A' || target.tagName === 'BUTTON' || target.closest('a, button')) {
      return;
    }
    
    handleEquipmentCardClick(equipmentId);
  };

  if (isMobile) {
    return (
      <div className="min-h-screen">
        {/* Map at top for mobile */}
        <div className="h-[50vh] relative">
          <div ref={mapContainer} className="w-full h-full" />
          <MapLegend activeCategory={activeCategory} viewMode={viewMode} />
        </div>
        
        {/* Equipment list below map */}
        <div ref={listRef} className="p-4">
          {isLocationBased && (
            <div className="mb-4 text-sm text-muted-foreground">
              Distances calculated from your location
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEquipment.map((equipment) => (
              <div
                key={equipment.id}
                id={`equipment-card-${equipment.id}`}
                className={`transition-all duration-300 rounded-lg ${
                  selectedEquipmentId === equipment.id
                    ? 'ring-2 ring-primary ring-offset-2'
                    : ''
                }`}
                onClick={(e) => handleCardWrapperClick(e, equipment.id)}
              >
                <CompactEquipmentCard equipment={equipment} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Desktop layout: list on left, map on right
  return (
    <div className="h-[calc(100vh-12rem)] flex">
      {/* Equipment list on left */}
      <div className="w-3/5 overflow-y-auto p-4">
        {isLocationBased && (
          <div className="mb-4 text-sm text-muted-foreground">
            Distances calculated from your location
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEquipment.map((equipment) => (
            <div
              key={equipment.id}
              id={`equipment-card-${equipment.id}`}
              className={`transition-all duration-300 cursor-pointer rounded-lg ${
                selectedEquipmentId === equipment.id
                  ? 'ring-2 ring-primary ring-offset-2'
                  : ''
              }`}
              onClick={(e) => handleCardWrapperClick(e, equipment.id)}
            >
              <CompactEquipmentCard equipment={equipment} />
            </div>
          ))}
          {filteredEquipment.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">No equipment found</h3>
              <p className="text-muted-foreground">
                Try changing your filters or explore a different category.
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Map on right */}
      <div className="w-2/5 relative">
        <div ref={mapContainer} className="w-full h-full" />
        <MapLegend activeCategory={activeCategory} viewMode={viewMode} />
      </div>
    </div>
  );
};

export default HybridView;