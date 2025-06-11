
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useUserRole";

export const useAppSettings = () => {
  return useQuery({
    queryKey: ['appSettings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('setting_key, setting_value')
        .eq('setting_key', 'show_mock_data')
        .single();

      if (error) {
        console.error('Error fetching app settings:', error);
        return { show_mock_data: true }; // Default fallback
      }

      return {
        show_mock_data: data?.setting_value === true
      };
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useUpdateAppSettings = () => {
  const queryClient = useQueryClient();
  const { isAdmin } = useIsAdmin();

  return useMutation({
    mutationFn: async (showMockData: boolean) => {
      if (!isAdmin) {
        throw new Error('Only admins can update app settings');
      }

      const { error } = await supabase
        .from('app_settings')
        .update({ 
          setting_value: showMockData,
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', 'show_mock_data');

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate and refetch app settings
      queryClient.invalidateQueries({ queryKey: ['appSettings'] });
    },
  });
};
