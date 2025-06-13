
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UserEquipment {
  id: string;
  name: string;
  description: string;
  price_per_day: number;
  image_url: string | null;
  rating: number;
  review_count: number;
}

export const useUserEquipment = (userId: string) => {
  return useQuery({
    queryKey: ['userEquipment', userId],
    queryFn: async (): Promise<UserEquipment[]> => {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const { data, error } = await supabase
        .from('equipment')
        .select(`
          id,
          name,
          description,
          price_per_day,
          image_url,
          rating,
          review_count
        `)
        .eq('user_id', userId)
        .eq('status', 'available')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user equipment:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!userId,
  });
};
