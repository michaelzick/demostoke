
import { geocodeZipCode } from "@/utils/geocoding";

interface LocationHandlingParams {
  zipCode: string;
  currentZip: string;
}

export const useEditGearLocationHandling = () => {
  const handleLocationUpdate = async ({ zipCode, currentZip }: LocationHandlingParams) => {
    // Get coordinates from zip code (only if zip code changed)
    let coordinates = null;
    if (zipCode !== currentZip) {
      try {
        coordinates = await geocodeZipCode(zipCode);
        console.log('Updated coordinates for zip code', zipCode, ':', coordinates);
      } catch (error) {
        console.error('Geocoding failed:', error);
      }
    }
    return coordinates;
  };

  return { handleLocationUpdate };
};
