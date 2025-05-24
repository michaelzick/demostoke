
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserEquipment } from "@/types/equipment";
import { useAuth } from "@/helpers";

export const useEquipmentById = (id: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['equipment', id],
    queryFn: async (): Promise<UserEquipment | null> => {
      if (!user?.id || !id) {
        return null;
      }

      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching equipment:', error);
        throw error;
      }

      if (!data) {
        return null;
      }

      // Cast the data to UserEquipment to ensure proper typing
      return {
        ...data,
        status: data.status as 'available' | 'booked' | 'unavailable'
      } as UserEquipment;
    },
    enabled: !!user?.id && !!id,
  });
};
