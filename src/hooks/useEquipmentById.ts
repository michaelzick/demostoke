
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Equipment } from "@/types";
import { fetchEquipmentImages } from "@/utils/multipleImageHandling";

export const useEquipmentById = (id: string) => {
  return useQuery({
    queryKey: ['equipment', id],
    queryFn: async (): Promise<Equipment | null> => {
      if (!id) {
        throw new Error('Equipment ID is required');
      }

      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching equipment:', error);
        throw error;
      }

      if (!data) {
        return null;
      }

      // Fetch additional images from equipment_images table
      const additionalImages = await fetchEquipmentImages(data.id);
      const allImages = additionalImages.length > 0 ? additionalImages : (data.image_url ? [data.image_url] : []);

      // Convert to Equipment type
      return {
        id: data.id,
        name: data.name,
        category: data.category,
        description: data.description || '',
        image_url: data.image_url || '',
        images: allImages, // Include all images
        price_per_day: Number(data.price_per_day),
        rating: Number(data.rating || 0),
        review_count: data.review_count || 0,
        owner: {
          id: data.user_id,
          name: 'Owner',
          imageUrl: 'https://api.dicebear.com/6.x/avataaars/svg?seed=' + data.user_id,
          rating: 4.8,
          reviewCount: 15,
          responseRate: 95,
        },
        location: {
          lat: Number(data.location_lat || 34.0522),
          lng: Number(data.location_lng || -118.2437),
          zip: data.location_zip || 'Los Angeles, CA',
        },
        distance: 2.5,
        specifications: {
          size: data.size || '',
          weight: data.weight || '',
          material: data.material || '',
          suitable: data.suitable_skill_level || '',
        },
        availability: {
          available: data.status === 'available',
        },
        pricing_options: [
          { id: '1', price: Number(data.price_per_day), duration: 'day' }
        ],
        status: data.status || 'available',
        created_at: data.created_at,
        updated_at: data.updated_at,
        visible_on_map: data.visible_on_map !== undefined ? data.visible_on_map : true,
      };
    },
    enabled: !!id,
  });
};
