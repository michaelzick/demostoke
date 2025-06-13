
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UserStats {
  totalEquipment: number;
  averageRating: number;
  totalReviews: number;
  responseRate: number;
}

export const useUserStats = (userId: string) => {
  return useQuery({
    queryKey: ['userStats', userId],
    queryFn: async (): Promise<UserStats> => {
      if (!userId) {
        throw new Error('User ID is required');
      }

      // Get user's equipment
      const { data: equipment, error: equipmentError } = await supabase
        .from('equipment')
        .select('id, rating, review_count')
        .eq('user_id', userId);

      if (equipmentError) {
        console.error('Error fetching user equipment:', equipmentError);
        throw equipmentError;
      }

      // Get reviews for user's equipment
      const equipmentIds = equipment?.map(e => e.id) || [];
      
      let totalReviews = 0;
      let totalRating = 0;

      if (equipmentIds.length > 0) {
        const { data: reviews, error: reviewsError } = await supabase
          .from('equipment_reviews')
          .select('rating')
          .in('equipment_id', equipmentIds);

        if (reviewsError) {
          console.error('Error fetching reviews:', reviewsError);
        } else {
          totalReviews = reviews?.length || 0;
          totalRating = reviews?.reduce((sum, review) => sum + review.rating, 0) || 0;
        }
      }

      const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

      return {
        totalEquipment: equipment?.length || 0,
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews,
        responseRate: 95, // This would need to be calculated based on actual message/response data
      };
    },
    enabled: !!userId,
  });
};
