
import { geocodeZipCode } from "@/utils/geocoding";

interface LocationHandlingParams {
  zipCode: string;
  currentZip: string;
}

interface LocationHandlingResult {
  lat: number;
  lng: number;
}

export const useEditGearLocationHandling = () => {
  const handleLocationUpdate = async ({ zipCode, currentZip }: LocationHandlingParams): Promise<LocationHandlingResult | null> => {
    // Get coordinates from zip code (only if zip code changed)
    let coordinates = null;
    if (zipCode !== currentZip) {
      try {
        console.log('🔍 Attempting to geocode zip code:', zipCode);
        coordinates = await geocodeZipCode(zipCode);
        
        if (coordinates) {
          console.log('✅ Successfully geocoded zip code', zipCode, ':', coordinates);
        } else {
          console.warn('⚠️ Geocoding returned null for zip code:', zipCode);
          // Try a retry with a delay
          console.log('🔄 Retrying geocoding after delay...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          coordinates = await geocodeZipCode(zipCode);
          
          if (coordinates) {
            console.log('✅ Retry successful for zip code', zipCode, ':', coordinates);
          } else {
            console.error('❌ Geocoding failed after retry for zip code:', zipCode);
          }
        }
      } catch (error) {
        console.error('❌ Geocoding error for zip code', zipCode, ':', error);
        
        // Try one more time with a longer delay
        try {
          console.log('🔄 Final retry attempt for geocoding...');
          await new Promise(resolve => setTimeout(resolve, 2000));
          coordinates = await geocodeZipCode(zipCode);
          
          if (coordinates) {
            console.log('✅ Final retry successful for zip code', zipCode, ':', coordinates);
          } else {
            console.error('❌ All geocoding attempts failed for zip code:', zipCode);
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
