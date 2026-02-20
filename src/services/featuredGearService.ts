import { supabase } from "@/integrations/supabase/client";
import { getHiddenUserIds } from "./equipment/hiddenUserFilter";

export const featuredGearService = {
  // Get count of currently featured equipment
  async getFeaturedCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('equipment')
        .select('*', { count: 'exact', head: true })
        .eq('is_featured', true);

      if (error) {
        console.error('Error getting featured count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error getting featured count:', error);
      return 0;
    }
  },

  // Set featured status for equipment with 3-item limit
  async setFeaturedStatus(equipmentId: string, isFeatured: boolean): Promise<{ success: boolean; message?: string }> {
    try {
      if (isFeatured) {
        // Check if we already have 3 featured items
        const currentCount = await this.getFeaturedCount();
        if (currentCount >= 3) {
          return { 
            success: false, 
            message: "Maximum of 3 featured gear items allowed. Please unfeature another item first." 
          };
        }
      }

      const { error } = await supabase
        .from('equipment')
        .update({ is_featured: isFeatured })
        .eq('id', equipmentId);

      if (error) {
        console.error('Error updating featured status:', error);
        return { success: false, message: "Failed to update featured status." };
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating featured status:', error);
      return { success: false, message: "Failed to update featured status." };
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

      // Filter out hidden users
      const hiddenUserIds = await getHiddenUserIds();

      // Transform the data to match the Equipment interface
      return data?.filter(equipment => !hiddenUserIds.has(equipment.user_id)).map(equipment => {
        const images = equipment.equipment_images
          ?.sort((a, b) => {
            if (a.is_primary && !b.is_primary) return -1;
            if (!a.is_primary && b.is_primary) return 1;
            return a.display_order - b.display_order;
          })
          .map(img => img.image_url) || [];

        return {
          id: equipment.id,
          user_id: equipment.user_id,
          name: equipment.name,
          category: equipment.category,
          subcategory: equipment.subcategory,
          description: equipment.description || '',
          image_url: images.length > 0 ? images[0] : '',
          images: images,
          price_per_day: Number(equipment.price_per_day),
          price_per_hour: equipment.price_per_hour ? Number(equipment.price_per_hour) : undefined,
          price_per_week: equipment.price_per_week ? Number(equipment.price_per_week) : undefined,
          rating: Number(equipment.rating || 0),
          review_count: equipment.review_count || 0,
          damage_deposit: equipment.damage_deposit ? Number(equipment.damage_deposit) : undefined,
          owner: {
            id: equipment.profiles?.id || equipment.user_id,
            name: equipment.profiles?.name || 'Unknown Owner',
            imageUrl: equipment.profiles?.avatar_url || `https://api.dicebear.com/6.x/avataaars/svg?seed=${equipment.user_id}`,
            rating: 4.8,
            reviewCount: 15,
            responseRate: 95
          },
          location: {
            lat: Number(equipment.location_lat || 0),
            lng: Number(equipment.location_lng || 0),
            address: equipment.location_address || ''
          },
          distance: 2.5,
          specifications: {
            size: equipment.size || '',
            weight: equipment.weight || '',
            material: equipment.material || '',
            suitable: equipment.suitable_skill_level || ''
          },
          availability: {
            available: equipment.status === 'available'
          },
          pricing_options: [],
          status: equipment.status,
          created_at: equipment.created_at,
          updated_at: equipment.updated_at,
          visible_on_map: equipment.visible_on_map
        };
      }) || [];
    } catch (error) {
      console.error('Error fetching featured equipment:', error);
      return [];
    }
  }
};