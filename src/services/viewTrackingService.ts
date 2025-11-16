
import { supabase } from "@/integrations/supabase/client";

// Simple in-memory cache for view deduplication
const recentViews = new Map<string, number>();

export const trackEquipmentView = async (equipmentId: string, userId?: string) => {
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

    // Update user's recently viewed equipment if userId is provided
    if (userId) {
      trackUserEquipmentView(equipmentId, userId).catch(error => {
        console.error('❌ Error updating user recently viewed:', error);
        // Don't throw - this is non-blocking
      });
    }
  } catch (error) {
    console.error('❌ Exception tracking equipment view:', error);
  }
};

// Track equipment view in user's profile
const trackUserEquipmentView = async (equipmentId: string, userId: string) => {
  try {
    // Get current recently viewed equipment
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('recently_viewed_equipment')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('Error fetching profile:', fetchError);
      return;
    }

    // Get existing array or initialize empty array
    const recentlyViewed = (profile?.recently_viewed_equipment || []) as Array<{
      equipment_id: string;
      viewed_at: string;
    }>;

    // Remove existing entry for this equipment (deduplication)
    const filtered = recentlyViewed.filter(item => item.equipment_id !== equipmentId);

    // Add new entry at the beginning
    const updated = [
      {
        equipment_id: equipmentId,
        viewed_at: new Date().toISOString()
      },
      ...filtered
    ].slice(0, 10); // Keep only 10 most recent

    // Update profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ recently_viewed_equipment: updated })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating profile:', updateError);
    }
  } catch (error) {
    console.error('Exception in trackUserEquipmentView:', error);
  }
};
