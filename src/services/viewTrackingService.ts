
import { supabase } from "@/integrations/supabase/client";

// Simple function to get client IP (basic implementation)
const getClientIP = (): string => {
  // In a real app, you might get this from headers or a service
  // For now, we'll use a simple fallback
  return 'unknown';
};

export const trackEquipmentView = async (equipmentId: string) => {
  try {
    console.log(`👀 Tracking view for equipment: ${equipmentId}`);

    // Get current user if authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    // Get client IP for basic deduplication
    const viewerIP = getClientIP();
    
    // Check if this IP has viewed this equipment in the last hour (basic deduplication)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { data: recentViews, error: checkError } = await supabase
      .from('equipment_views')
      .select('id')
      .eq('equipment_id', equipmentId)
      .eq('viewer_ip', viewerIP)
      .gte('viewed_at', oneHourAgo)
      .limit(1);

    if (checkError) {
      console.error('❌ Error checking recent views:', checkError);
      return;
    }

    // If there's a recent view from the same IP, don't record another one
    if (recentViews && recentViews.length > 0) {
      console.log('⏰ Recent view found from same IP, skipping duplicate');
      return;
    }

    // Record the view
    const { error: insertError } = await supabase
      .from('equipment_views')
      .insert({
        equipment_id: equipmentId,
        viewer_ip: viewerIP,
        user_id: user?.id || null,
        viewed_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('❌ Error recording equipment view:', insertError);
      return;
    }

    console.log('✅ Equipment view recorded successfully');
    
  } catch (error) {
    console.error('❌ Exception tracking equipment view:', error);
  }
};
