
import NodeGeocoder from 'node-geocoder';

// Create geocoder instance
const geocoder = NodeGeocoder({
  provider: 'openstreetmap',
  // OpenStreetMap doesn't require an API key
  httpAdapter: 'https',
  formatter: null
});

export interface Coordinates {
  lat: number;
  lng: number;
}

export const getCoordinatesFromZipCode = async (zipCode: string): Promise<Coordinates | null> => {
  try {
    if (!zipCode || zipCode.trim() === '') {
      return null;
    }

    // For US zip codes, add "USA" to improve accuracy
    const searchQuery = zipCode.length === 5 ? `${zipCode}, USA` : zipCode;
    
    const results = await geocoder.geocode(searchQuery);
    
    if (results && results.length > 0) {
      const result = results[0];
      return {
        lat: result.latitude || 0,
        lng: result.longitude || 0
      };
    }
    
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};
