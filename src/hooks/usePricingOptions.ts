
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PricingOption {
  id: string;
  price: number;
  duration: string;
}

export const usePricingOptions = (equipmentId: string) => {
  // Check if this is a real UUID (for DB equipment) or a mock ID
  const isRealId = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(equipmentId);

  return useQuery({
    queryKey: ['pricing-options', equipmentId],
    queryFn: async (): Promise<PricingOption[]> => {
      if (!equipmentId || !isRealId) {
        return [];
      }

      const { data, error } = await supabase
        .from('pricing_options')
        .select('*')
        .eq('equipment_id', equipmentId)
        .order('price', { ascending: true });

      if (error) {
        console.error('Error fetching pricing options:', error);
        throw error;
      }

      return data || [];
    },
    enabled: isRealId && !!equipmentId, // Only run query for real DB equipment IDs
  });
};
