import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUseAISearchPreference, setUseAISearchPreference } from "@/services/userPreferencesService";

export const useSearchPreference = () => {
  return useQuery({
    queryKey: ["aiSearchPreference"],
    queryFn: async () => ({ use_ai_search: await getUseAISearchPreference() }),
    staleTime: 30 * 1000,
  });
};

export const useUpdateSearchPreference = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (value: boolean) => {
      await setUseAISearchPreference(value);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aiSearchPreference"] });
    },
  });
};
