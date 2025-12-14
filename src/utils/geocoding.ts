
import { supabase } from "@/integrations/supabase/client";

export interface GeocodeResult {
  lat: number;
  lng: number;
}

export const geocodeZipCode = async (zipCode: string): Promise<GeocodeResult | null> => {
  try {
    console.log('🔍 Geocoding zip code:', zipCode);
    
    // Get Mapbox token from Supabase function
    const { data: tokenData, error: tokenError } = await supabase.functions.invoke('get-mapbox-token');
    
    if (tokenError || !tokenData?.token) {
      console.error('❌ Failed to get Mapbox token:', tokenError);
      return null;
    }

    const mapboxToken = tokenData.token;
    
    // Use Mapbox Geocoding API
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(zipCode)}.json?access_token=${mapboxToken}&country=US&types=postcode`
    );

    if (!response.ok) {
      console.error('❌ Mapbox geocoding request failed:', response.status);
      return null;
    }

    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center;
      console.log('✅ Zip code geocoding successful:', { lat, lng });
      return { lat, lng };
    }

    console.warn('⚠️ No geocoding results found for zip code:', zipCode);
    return null;
  } catch (error) {
    console.error('❌ Geocoding error:', error);
    return null;
  }
};

export const geocodeAddress = async (address: string): Promise<GeocodeResult | null> => {
  try {
    console.log('🔍 Starting address geocoding for:', address);
    
    // Get Mapbox token from Supabase function
    console.log('🔑 Fetching Mapbox token...');
    const { data: tokenData, error: tokenError } = await supabase.functions.invoke('get-mapbox-token');
    
    if (tokenError || !tokenData?.token) {
      console.error('❌ Failed to get Mapbox token:', tokenError);
      return null;
    }

    console.log('✅ Mapbox token obtained successfully');
    const mapboxToken = tokenData.token;
    
    // Use Mapbox Geocoding API for addresses (no country restriction for international support)
    const geocodingUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxToken}`;
    console.log('🌐 Making geocoding request to:', geocodingUrl.replace(mapboxToken, '[TOKEN]'));
    
    const response = await fetch(geocodingUrl);

    if (!response.ok) {
      console.error('❌ Mapbox address geocoding request failed:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('❌ Response body:', errorText);
      return null;
    }

    const data = await response.json();
    console.log('📍 Geocoding response:', data);
    
    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center;
      const result = { lat, lng };
      console.log('✅ Address geocoding successful:', result);
      return result;
    }

    console.warn('⚠️ No geocoding results found for address:', address);
    return null;
  } catch (error) {
    console.error('❌ Address geocoding error:', error);
    return null;
  }
};
