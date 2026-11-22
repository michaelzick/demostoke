import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { loadPublicGearReviews } from "@/services/public-gear-reviews";
import { useSsrPageData } from "@/contexts/SsrPageDataContext";

export const usePublicGearReviews = (equipmentId: string) => {
  const { equipment, reviews } = useSsrPageData();
  return useQuery({
    queryKey: ['publicGearReviews', equipmentId],
    queryFn: () => loadPublicGearReviews(supabase, equipmentId),
    initialData: equipment?.id === equipmentId ? reviews : undefined,
    enabled: !!equipmentId,
  });
};
