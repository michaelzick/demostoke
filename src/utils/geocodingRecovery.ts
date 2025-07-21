
import { supabase } from "@/integrations/supabase/client";
import { geocodeZipCode } from "./geocoding";

interface EquipmentToGeocode {
  id: string;
  name: string;
  location_address: string;
  location_lat: number | null;
  location_lng: number | null;
}

export const findEquipmentMissingCoordinates = async (): Promise<EquipmentToGeocode[]> => {
  console.log('🔍 Finding equipment missing coordinates...');
  
  const { data, error } = await supabase
    .from('equipment')
    .select('id, name, location_address, location_lat, location_lng')
    .not('location_address', 'is', null)
    .or('location_lat.is.null,location_lng.is.null');

  if (error) {
    console.error('❌ Error finding equipment missing coordinates:', error);
    throw error;
  }

  console.log('📊 Found equipment missing coordinates:', data?.length || 0);
  return data || [];
};

export const geocodeEquipmentBatch = async (equipment: EquipmentToGeocode[]): Promise<{
  successful: number;
  failed: number;
  results: Array<{ id: string; name: string; success: boolean; error?: string; }>
}> => {
  console.log('🌍 Starting batch geocoding for', equipment.length, 'items...');
  
  const results = [];
  let successful = 0;
  let failed = 0;

  for (const item of equipment) {
    try {
      console.log(`🔍 Geocoding ${item.name} with address ${item.location_address}...`);
      
      const coordinates = await geocodeZipCode(item.location_address);
      
      if (coordinates) {
        // Update the equipment with coordinates
        const { error: updateError } = await supabase
          .from('equipment')
          .update({
            location_lat: coordinates.lat,
            location_lng: coordinates.lng
          })
          .eq('id', item.id);

        if (updateError) {
          console.error(`❌ Failed to update coordinates for ${item.name}:`, updateError);
          results.push({ id: item.id, name: item.name, success: false, error: updateError.message });
          failed++;
        } else {
          console.log(`✅ Successfully geocoded ${item.name}:`, coordinates);
          results.push({ id: item.id, name: item.name, success: true });
          successful++;
        }
      } else {
        console.warn(`⚠️ Failed to geocode ${item.name} with address ${item.location_address}`);
        results.push({ id: item.id, name: item.name, success: false, error: 'Geocoding failed' });
        failed++;
      }

      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`❌ Exception geocoding ${item.name}:`, error);
      results.push({ 
        id: item.id, 
        name: item.name, 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      failed++;
    }
  }

  console.log(`🏁 Batch geocoding complete: ${successful} successful, ${failed} failed`);
  return { successful, failed, results };
};

export const runGeocodingRecovery = async (): Promise<{
  totalFound: number;
  successful: number;
  failed: number;
  results: Array<{ id: string; name: string; success: boolean; error?: string; }>
}> => {
  try {
    const equipmentToGeocode = await findEquipmentMissingCoordinates();
    
    if (equipmentToGeocode.length === 0) {
      console.log('✅ No equipment needs geocoding - all items have coordinates');
      return { totalFound: 0, successful: 0, failed: 0, results: [] };
    }

    const batchResult = await geocodeEquipmentBatch(equipmentToGeocode);
    
    return {
      totalFound: equipmentToGeocode.length,
      ...batchResult
    };
  } catch (error) {
    console.error('❌ Error in geocoding recovery:', error);
    throw error;
  }
};
