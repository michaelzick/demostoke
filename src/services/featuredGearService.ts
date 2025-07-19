import { supabase } from "@/integrations/supabase/client";

export const featuredGearService = {
  // Set featured status for equipment
  async setFeaturedStatus(equipmentId: string, isFeatured: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('equipment')
        .update({ is_featured: isFeatured })
        .eq('id', equipmentId);

      if (error) {
        console.error('Error updating featured status:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating featured status:', error);
      return false;
    }
  },

  // Get featured equipment
  async getFeaturedEquipment() {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select(`
          *,
          equipment_images!inner(
            image_url,
            display_order,
            is_primary
          ),
          profiles!equipment_user_id_fkey(
            id,
            name,
            avatar_url
          )
        `)
        .eq('is_featured', true)
        .eq('status', 'available')
        .eq('visible_on_map', true)
        .order('updated_at', { ascending: false })
        .limit(6);

      if (error) {
        console.error('Error fetching featured equipment:', error);
        return [];
      }

      // Transform the data to match the Equipment interface
      return data?.map(equipment => ({
        ...equipment,
        owner: {
          id: equipment.profiles?.id || equipment.user_id,
          name: equipment.profiles?.name || 'Unknown Owner',
          avatar_url: equipment.profiles?.avatar_url,
          shopId: null,
          partyId: equipment.user_id
        },
        location: {
          address: equipment.location_address || '',
          latitude: equipment.location_lat,
          longitude: equipment.location_lng
        },
        images: equipment.equipment_images
          ?.sort((a, b) => {
            if (a.is_primary && !b.is_primary) return -1;
            if (!a.is_primary && b.is_primary) return 1;
            return a.display_order - b.display_order;
          })
          .map(img => img.image_url) || []
      })) || [];
    } catch (error) {
      console.error('Error fetching featured equipment:', error);
      return [];
    }
  }
};