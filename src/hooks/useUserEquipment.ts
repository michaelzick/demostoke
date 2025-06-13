
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/helpers";

interface UserEquipment {
  id: string;
  name: string;
  category: string;
  description: string;
  price_per_day: number;
  image_url: string | null;
  rating: number;
  review_count: number;
  status: 'available' | 'booked' | 'unavailable';
  created_at: string;
  updated_at: string;
  visible_on_map: boolean;
  location: {
    lat: number;
    lng: number;
    zip: string;
  };
  specifications: {
    size: string;
    weight: string;
    material: string;
    suitable: string;
  };
  availability: {
    available: boolean;
  };
}

export const useUserEquipment = (userId?: string) => {
  const { user } = useAuth();
  const effectiveUserId = userId || user?.id;

  return useQuery({
    queryKey: ['userEquipment', effectiveUserId],
    queryFn: async (): Promise<UserEquipment[]> => {
      if (!effectiveUserId) {
        throw new Error('User ID is required');
      }

      const { data, error } = await supabase
        .from('equipment')
        .select(`
          id,
          name,
          category,
          description,
          price_per_day,
          image_url,
          rating,
          review_count,
          status,
          created_at,
          updated_at,
          visible_on_map,
          location_lat,
          location_lng,
          location_zip,
          size,
          weight,
          material,
          suitable_skill_level
        `)
        .eq('user_id', effectiveUserId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user equipment:', error);
        throw error;
      }

      return (data || []).map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        description: item.description || '',
        price_per_day: item.price_per_day,
        image_url: item.image_url,
        rating: item.rating || 0,
        review_count: item.review_count || 0,
        status: item.status as 'available' | 'booked' | 'unavailable',
        created_at: item.created_at,
        updated_at: item.updated_at,
        visible_on_map: item.visible_on_map,
        location: {
          lat: item.location_lat || 0,
          lng: item.location_lng || 0,
          zip: item.location_zip || ''
        },
        specifications: {
          size: item.size || '',
          weight: item.weight || '',
          material: item.material || '',
          suitable: item.suitable_skill_level || ''
        },
        availability: {
          available: item.status === 'available'
        }
      }));
    },
    enabled: !!effectiveUserId,
  });
};

export const useDeleteEquipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (equipmentId: string) => {
      const { error } = await supabase
        .from('equipment')
        .delete()
        .eq('id', equipmentId);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userEquipment'] });
    },
  });
};

export const useUpdateEquipmentVisibility = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ equipmentId, visible }: { equipmentId: string; visible: boolean }) => {
      const { error } = await supabase
        .from('equipment')
        .update({ visible_on_map: visible })
        .eq('id', equipmentId);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userEquipment'] });
    },
  });
};
