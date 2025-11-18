
import { supabase } from "@/integrations/supabase/client";
import { QueryClient } from "@tanstack/react-query";
import { addLocalRVI } from "./localStorageRVIService";

// Simple in-memory cache for view deduplication
const recentViews = new Map<string, number>();

export const trackEquipmentView = async (equipmentId: string, userId?: string, queryClient?: QueryClient) => {
  console.log('🔍 trackEquipmentView called:', { equipmentId, userId, hasUserId: !!userId });
  
  try {
    // Increment view count with deduplication (once per hour)
    const currentHour = Math.floor(Date.now() / (60 * 60 * 1000));
    const viewKey = `${equipmentId}-${currentHour}`;
    
    console.log('📊 View deduplication check:', { viewKey, alreadyViewed: recentViews.has(viewKey) });
    
    // Only increment view count if we haven't done so this hour
    if (!recentViews.has(viewKey)) {
      const { error: incrementError } = await supabase
        .rpc('increment_equipment_view_count', { equipment_id: equipmentId });

      if (incrementError) {
        console.error('❌ Error incrementing view count:', incrementError);
      } else {
        // Mark this equipment as viewed in this hour
        recentViews.set(viewKey, Date.now());
        
        // Clean up old entries (older than 2 hours)
        const twoHoursAgo = Date.now() - (2 * 60 * 60 * 1000);
        for (const [key, timestamp] of recentViews.entries()) {
          if (timestamp < twoHoursAgo) {
            recentViews.delete(key);
          }
        }
      }
    }

    // Track to database or localStorage
    if (userId) {
      console.log('✅ Calling trackUserEquipmentView (database) with:', { equipmentId, userId });
      trackUserEquipmentView(equipmentId, userId, queryClient).catch(error => {
        console.error('❌ Error updating user recently viewed:', error);
        // Don't throw - this is non-blocking
      });
    } else {
      console.log('💾 Tracking to localStorage (no userId)');
      addLocalRVI(equipmentId);
      // Invalidate query to refresh display
      queryClient?.invalidateQueries({ 
        queryKey: ['recentlyViewedEquipment', undefined] 
      });
    }
  } catch (error) {
    console.error('❌ Exception tracking equipment view:', error);
  }
};

// Track equipment view in user's profile
const trackUserEquipmentView = async (equipmentId: string, userId: string, queryClient?: QueryClient) => {
  console.log('🔵 trackUserEquipmentView started:', { equipmentId, userId });
  
  try {
    // Get current recently viewed equipment
    console.log('📥 Fetching profile for userId:', userId);
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('recently_viewed_equipment')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching profile:', fetchError);
      return;
    }
    
    console.log('📋 Profile fetched:', { 
      profileExists: !!profile, 
      currentRecentlyViewed: profile?.recently_viewed_equipment 
    });

    // Get existing array or initialize empty array
    const recentlyViewed = (profile?.recently_viewed_equipment || []) as Array<{
      equipment_id: string;
      viewed_at: string;
    }>;
    
    console.log('📦 Current recently viewed array:', recentlyViewed);

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
    
    console.log('🔄 Updated array to save:', updated);

    // Update profile
    console.log('💾 Attempting to update profile...');
    const { error: updateError, data: updateData } = await supabase
      .from('profiles')
      .update({ recently_viewed_equipment: updated })
      .eq('id', userId)
      .select('recently_viewed_equipment')
      .single();

    if (updateError) {
      console.error('❌ Error updating profile:', updateError);
    } else {
      console.log('✅ Profile successfully updated:', updateData);
      console.log('✅ New recently_viewed_equipment:', updateData?.recently_viewed_equipment);
      
      // Invalidate the recently viewed equipment query cache
      if (queryClient) {
        queryClient.invalidateQueries({ 
          queryKey: ['recentlyViewedEquipment', userId],
          exact: true 
        });
      }
    }
  } catch (error) {
    console.error('Exception in trackUserEquipmentView:', error);
  }
};
