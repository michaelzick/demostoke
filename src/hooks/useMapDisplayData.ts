
import { useMemo, useEffect, useState } from 'react';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useUserLocations } from '@/hooks/useUserLocations';
import { useToast } from '@/hooks/use-toast';

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

interface UseMapDisplayDataProps {
  activeCategory: string | null;
  initialEquipment?: MapEquipment[];
  userLocations?: UserLocation[];
  isSingleView: boolean;
  searchQuery?: string;
  mapLoaded: boolean;
}

export const useMapDisplayData = ({
  activeCategory,
  initialEquipment,
  userLocations: propUserLocations,
  isSingleView,
  searchQuery,
  mapLoaded
}: UseMapDisplayDataProps) => {
  const { toast } = useToast();
  const [hasShownNoGearToast, setHasShownNoGearToast] = useState(false);

  // Get app settings to determine display mode
  const { data: appSettings } = useAppSettings();
  const isUserLocationMode = appSettings?.map_display_mode === 'user_locations';

  // Fetch user locations when in user location mode and no specific user locations are provided
  const { data: fetchedUserLocations = [], isLoading: userLocationsLoading } = useUserLocations();

  // Use provided user locations or fetched ones
  const userLocations = propUserLocations || fetchedUserLocations;

  // Debug logging for display mode
  useEffect(() => {
    console.log('🔍 Map display mode:', appSettings?.map_display_mode);
    console.log('👥 Is user location mode:', isUserLocationMode);
    console.log('📍 User locations count:', userLocations.length);
    console.log('⚙️ Equipment count:', initialEquipment?.length || 0);
    console.log('🏷️ Active category:', activeCategory);
  }, [appSettings, isUserLocationMode, userLocations.length, initialEquipment?.length, activeCategory]);

  // Filter user locations based on active category
  const filteredUserLocations = useMemo(() => {
    return isUserLocationMode && activeCategory 
      ? userLocations.filter(user => 
          user.equipment_categories.includes(activeCategory)
        )
      : userLocations;
  }, [isUserLocationMode, activeCategory, userLocations]);

  // Determine what to display based on mode
  const displayEquipment = useMemo(() => {
    return isUserLocationMode ? [] : (initialEquipment || []);
  }, [isUserLocationMode, initialEquipment]);

  const displayUserLocations = useMemo(() => {
    return isUserLocationMode ? filteredUserLocations : [];
  }, [isUserLocationMode, filteredUserLocations]);

  // Show toast when no data is found (only once per search/filter change)
  useEffect(() => {
    if (mapLoaded && !isSingleView) {
      const hasData = isUserLocationMode 
        ? displayUserLocations.length > 0 
        : displayEquipment.length > 0;

      if (!hasData && !userLocationsLoading) {
        if (!hasShownNoGearToast) {
          const message = isUserLocationMode
            ? activeCategory
              ? `No users found with ${activeCategory} in their inventory. Try selecting a different category or clearing filters.`
              : "No user locations found. Users need to add addresses to their profiles to appear on the map."
            : searchQuery
            ? `No equipment found matching "${searchQuery}". Try adjusting your search or filters.`
            : activeCategory
            ? `No equipment found in the ${activeCategory} category. Try a different category or clear filters.`
            : "No equipment found in this area. Try expanding your search area or adjusting filters.";

          toast({
            title: isUserLocationMode ? "No user locations found" : "No gear found",
            description: message,
            variant: "default",
          });
          setHasShownNoGearToast(true);
        }
      } else {
        setHasShownNoGearToast(false);
      }
    }
  }, [mapLoaded, displayEquipment.length, displayUserLocations.length, userLocationsLoading, isSingleView, searchQuery, activeCategory, toast, hasShownNoGearToast, isUserLocationMode]);

  return {
    isUserLocationMode,
    displayEquipment,
    displayUserLocations,
    userLocationsLoading
  };
};
