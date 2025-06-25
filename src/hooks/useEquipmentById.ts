
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

      console.log('=== FETCHING EQUIPMENT BY ID ===');
      console.log('Equipment ID:', id);

      const { data, error } = await supabase
        .from('equipment')
        .select(`
          *,
          profiles!equipment_user_id_fkey (
            name,
            avatar_url
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching equipment:', error);
        throw error;
      }

      if (!data) {
        return null;
      }

      // Log the raw data to see what we're getting from the database
      console.log('Raw equipment data from database:', data);
      console.log('Profile data:', data.profiles);
      console.log('Damage deposit from database:', data.damage_deposit);
      console.log('Primary image URL:', data.image_url);
      console.log('Has multiple images flag:', data.has_multiple_images);

      // Fetch additional images from equipment_images table
      console.log('Fetching additional images for equipment ID:', data.id);
      const additionalImages = await fetchEquipmentImages(data.id);
      console.log('Additional images fetched:', additionalImages);
      console.log('Additional images count:', additionalImages.length);

      // Create combined images array
      const allImages = additionalImages.length > 0 ? additionalImages : (data.image_url ? [data.image_url] : []);
      console.log('Final combined images array:', allImages);
      console.log('Final images array length:', allImages.length);

      // Convert to Equipment type with proper damage_deposit mapping and real owner name
      const equipment = {
        id: data.id,
        name: data.name,
        category: data.category,
        subcategory: data.subcategory,
        description: data.description || '',
        image_url: data.image_url || '',
        images: allImages, // Include all images
        price_per_day: Number(data.price_per_day),
        rating: Number(data.rating || 0),
        review_count: data.review_count || 0,
        damage_deposit: data.damage_deposit ? Number(data.damage_deposit) : undefined, // Add damage_deposit mapping
        owner: {
          id: data.user_id,
          name: data.profiles?.name || 'Owner', // Use the joined profile name or fallback to 'Owner'
          imageUrl: data.profiles?.avatar_url || 'https://api.dicebear.com/6.x/avataaars/svg?seed=' + data.user_id,
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

      console.log('Mapped equipment object:', equipment);
      console.log('Mapped owner name:', equipment.owner.name);
      console.log('Mapped damage_deposit:', equipment.damage_deposit);
      console.log('Mapped images array:', equipment.images);
      console.log('=== END EQUIPMENT FETCH ===');

      return equipment;
    },
    enabled: !!id,
  });
};
