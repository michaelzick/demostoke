
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PricingOption {
  id: string;
  price: number;
  duration: string;
}

export const usePricingOptions = (equipmentId: string) => {
  return useQuery({
    queryKey: ['pricing-options', equipmentId],
    queryFn: async (): Promise<PricingOption[]> => {
      if (!equipmentId) {
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
    enabled: !!equipmentId,
  });
};
