// This hook is deprecated - we now use price columns directly from the equipment table
// Keeping this file for backward compatibility but it returns empty data

import { useQuery } from "@tanstack/react-query";

export const usePricingOptions = (equipmentId: string) => {
  return useQuery({
    queryKey: ['pricing-options', equipmentId],
    queryFn: async () => {
      // Return empty array since we're not using pricing_options table anymore
      console.log('usePricingOptions is deprecated - using equipment price columns instead');
      return [];
    },
    enabled: false, // Disable the query
  });
};
