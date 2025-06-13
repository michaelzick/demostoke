
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface EquipmentReview {
  id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  reviewer_id: string;
}

export const useEquipmentReviews = (equipmentId: string) => {
  return useQuery({
    queryKey: ['equipmentReviews', equipmentId],
    queryFn: async (): Promise<EquipmentReview[]> => {
      if (!equipmentId) {
        throw new Error('Equipment ID is required');
      }

      const { data, error } = await supabase
        .from('equipment_reviews')
        .select('*')
        .eq('equipment_id', equipmentId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching equipment reviews:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!equipmentId,
  });
};
