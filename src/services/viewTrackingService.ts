
import { supabase } from "@/integrations/supabase/client";

// Simple in-memory cache for view deduplication
const recentViews = new Map<string, number>();

export const trackEquipmentView = async (equipmentId: string) => {
  try {

    // Simple deduplication using in-memory cache
    // Create a key based on equipment ID and timestamp (rounded to nearest hour)
    const currentHour = Math.floor(Date.now() / (60 * 60 * 1000));
    const viewKey = `${equipmentId}-${currentHour}`;
    
    // Check if we've already tracked a view for this equipment in this hour
    if (recentViews.has(viewKey)) {
      return;
    }

    // Increment the view count in the equipment table
    const { error: incrementError } = await supabase
      .rpc('increment_equipment_view_count', { equipment_id: equipmentId });

    if (incrementError) {
      console.error('❌ Error incrementing view count:', incrementError);
      return;
    }

    // Mark this equipment as viewed in this hour
    recentViews.set(viewKey, Date.now());
    
    // Clean up old entries (older than 2 hours)
    const twoHoursAgo = Date.now() - (2 * 60 * 60 * 1000);
    for (const [key, timestamp] of recentViews.entries()) {
      if (timestamp < twoHoursAgo) {
        recentViews.delete(key);
      }
    }

    
  } catch (error) {
    console.error('❌ Exception tracking equipment view:', error);
  }
};
