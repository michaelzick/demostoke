
import { useMapMarkers } from '@/hooks/useMapMarkers';
import { useMapboxToken } from '@/hooks/useMapboxToken';
import { useMapInitialization } from '@/hooks/useMapInitialization';
import { useMapDisplayData } from '@/hooks/useMapDisplayData';
import MapboxTokenForm from './map/MapboxTokenForm';
import MapLegend from './map/MapLegend';
import MapLoadingOverlay from './map/MapLoadingOverlay';

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

interface MapComponentProps {
  activeCategory: string | null;
  initialEquipment?: MapEquipment[];
  userLocations?: UserLocation[];
  isSingleView?: boolean;
  searchQuery?: string;
}

const MapComponent = ({ 
  activeCategory, 
  initialEquipment, 
  userLocations: propUserLocations, 
  isSingleView = false, 
  searchQuery 
}: MapComponentProps) => {
  const {
    token,
    showTokenInput,
    isLoadingToken,
    handleTokenSubmit,
    handleTokenError
  } = useMapboxToken();

  const {
    isUserLocationMode,
    displayEquipment,
    displayUserLocations,
    userLocationsLoading
  } = useMapDisplayData({
    activeCategory,
    initialEquipment,
    userLocations: propUserLocations,
    isSingleView,
    searchQuery,
    mapLoaded: true // We'll pass the actual mapLoaded state in the next step
  });

  const {
    mapContainer,
    map,
    mapLoaded
  } = useMapInitialization({
    token,
    isLoadingToken,
    onTokenError: handleTokenError,
    displayEquipment,
    displayUserLocations,
    isSingleView,
    isUserLocationMode
  });

  // Use the custom hook for managing markers
  useMapMarkers({ 
    map, 
    mapLoaded, 
    equipment: displayEquipment, 
    userLocations: displayUserLocations,
    isSingleView,
    activeCategory 
  });

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
      {showTokenInput ? (
        <MapboxTokenForm onTokenSubmit={handleTokenSubmit} isLoading={false} />
      ) : (
        <>
          <MapLegend activeCategory={activeCategory} />
          <div ref={mapContainer} className="w-full h-full" />
          <MapLoadingOverlay 
            isLoadingToken={isLoadingToken}
            userLocationsLoading={userLocationsLoading}
            isUserLocationMode={isUserLocationMode}
          />
        </>
      )}
    </div>
  );
};

export default MapComponent;
