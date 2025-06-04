
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserEquipment } from "@/types/equipment";
import { useAuth } from "@/helpers";

export const useUserEquipment = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-equipment', user?.id],
    queryFn: async (): Promise<UserEquipment[]> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user equipment:', error);
        throw error;
      }

      // Cast and transform the data to UserEquipment[]
      return (data || []).map(item => ({
        ...item,
        status: item.status as 'available' | 'booked' | 'unavailable',
        location: {
          lat: typeof item.location_lat === 'number' ? item.location_lat : 34.0522,  // Default to LA coordinates
          lng: typeof item.location_lng === 'number' ? item.location_lng : -118.2437,
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
      })) as UserEquipment[];
    },
    enabled: !!user?.id,
  });
};

export const useDeleteEquipment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (equipmentId: string) => {
      const { error } = await supabase
        .from('equipment')
        .delete()
        .eq('id', equipmentId)
        .eq('user_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-equipment'] });
    },
  });
};
