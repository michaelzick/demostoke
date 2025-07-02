
import { geocodeAddress } from "@/utils/geocoding";

interface LocationHandlingParams {
  address: string; // Changed from zipCode to address
  currentAddress: string; // Changed from currentZip to currentAddress
}

interface LocationHandlingResult {
  lat: number;
  lng: number;
}

export const useEditGearLocationHandling = () => {
  const handleLocationUpdate = async ({ address, currentAddress }: LocationHandlingParams): Promise<LocationHandlingResult | null> => {
    // Get coordinates from address (only if address changed)
    let coordinates = null;
    if (address !== currentAddress) {
      try {
        console.log('🔍 Attempting to geocode address:', address);
        coordinates = await geocodeAddress(address);
        
        if (coordinates) {
          console.log('✅ Successfully geocoded address', address, ':', coordinates);
        } else {
          console.warn('⚠️ Geocoding returned null for address:', address);
          // Try a retry with a delay
          console.log('🔄 Retrying geocoding after delay...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          coordinates = await geocodeAddress(address);
          
          if (coordinates) {
            console.log('✅ Retry successful for address', address, ':', coordinates);
          } else {
            console.error('❌ Geocoding failed after retry for address:', address);
          }
        }
      } catch (error) {
        console.error('❌ Geocoding error for address', address, ':', error);
        
        // Try one more time with a longer delay
        try {
          console.log('🔄 Final retry attempt for geocoding...');
          await new Promise(resolve => setTimeout(resolve, 2000));
          coordinates = await geocodeAddress(address);
          
          if (coordinates) {
            console.log('✅ Final retry successful for address', address, ':', coordinates);
          } else {
            console.error('❌ All geocoding attempts failed for address:', address);
          }
        } catch (retryError) {
          console.error('❌ Final retry also failed:', retryError);
        }
      }
    }
    return coordinates;
  };

  return { handleLocationUpdate };
};
