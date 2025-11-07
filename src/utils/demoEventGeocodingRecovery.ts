import { supabase } from "@/integrations/supabase/client";
import { geocodeAddress } from "./geocoding";

interface DemoEventToGeocode {
  id: string;
  title: string;
  location: string;
  location_lat: number | null;
  location_lng: number | null;
}

export const findDemoEventsMissingCoordinates = async (): Promise<DemoEventToGeocode[]> => {
  console.log('🔍 Finding demo events missing coordinates...');
  
  const { data, error } = await supabase
    .from('demo_calendar')
    .select('id, title, location, location_lat, location_lng')
    .not('location', 'is', null)
    .or('location_lat.is.null,location_lng.is.null');

  if (error) {
    console.error('❌ Error finding demo events missing coordinates:', error);
    throw error;
  }

  console.log('📊 Found demo events missing coordinates:', data?.length || 0);
  return data || [];
};

export const geocodeDemoEventsBatch = async (events: DemoEventToGeocode[]): Promise<{
  successful: number;
  failed: number;
  results: Array<{ id: string; title: string; success: boolean; error?: string; }>
}> => {
  console.log('🌍 Starting batch geocoding for', events.length, 'demo events...');
  
  const results = [];
  let successful = 0;
  let failed = 0;

  for (const event of events) {
    try {
      console.log(`🔍 Geocoding "${event.title}" with address "${event.location}"...`);
      
      const coordinates = await geocodeAddress(event.location);
      
      if (coordinates) {
        // Update the demo event with coordinates
        const { error: updateError } = await supabase
          .from('demo_calendar')
          .update({
            location_lat: coordinates.lat,
            location_lng: coordinates.lng
          })
          .eq('id', event.id);

        if (updateError) {
          console.error(`❌ Failed to update coordinates for "${event.title}":`, updateError);
          results.push({ id: event.id, title: event.title, success: false, error: updateError.message });
          failed++;
        } else {
          console.log(`✅ Successfully geocoded "${event.title}":`, coordinates);
          results.push({ id: event.id, title: event.title, success: true });
          successful++;
        }
      } else {
        console.warn(`⚠️ Failed to geocode "${event.title}" with address "${event.location}"`);
        results.push({ id: event.id, title: event.title, success: false, error: 'Geocoding failed' });
        failed++;
      }

      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`❌ Exception geocoding "${event.title}":`, error);
      results.push({ 
        id: event.id, 
        title: event.title, 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      failed++;
    }
  }

  console.log(`🏁 Batch geocoding complete: ${successful} successful, ${failed} failed`);
  return { successful, failed, results };
};

export const runDemoEventGeocodingRecovery = async (): Promise<{
  totalFound: number;
  successful: number;
  failed: number;
  results: Array<{ id: string; title: string; success: boolean; error?: string; }>
}> => {
  try {
    const eventsToGeocode = await findDemoEventsMissingCoordinates();
    
    if (eventsToGeocode.length === 0) {
      console.log('✅ No demo events need geocoding - all have coordinates');
      return { totalFound: 0, successful: 0, failed: 0, results: [] };
    }

    const batchResult = await geocodeDemoEventsBatch(eventsToGeocode);
    
    return {
      totalFound: eventsToGeocode.length,
      ...batchResult
    };
  } catch (error) {
    console.error('❌ Error in demo event geocoding recovery:', error);
    throw error;
  }
};
