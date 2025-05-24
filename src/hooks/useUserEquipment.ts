
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

      // Cast the data to UserEquipment[] to ensure proper typing
      return (data || []).map(item => ({
        ...item,
        status: item.status as 'available' | 'booked' | 'unavailable'
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
