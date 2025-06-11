
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useUserRole";

export const useAppSettings = () => {
  return useQuery({
    queryKey: ['appSettings'],
    queryFn: async () => {
      console.log('🔍 Fetching app settings from database...');
      const { data, error } = await supabase
        .from('app_settings')
        .select('setting_key, setting_value')
        .eq('setting_key', 'show_mock_data')
        .single();

      if (error) {
        console.error('❌ Error fetching app settings:', error);
        console.log('🔄 Using default fallback: show_mock_data = true');
        return { show_mock_data: true }; // Default fallback
      }

      const result = {
        show_mock_data: data?.setting_value === true
      };
      
      console.log('✅ App settings fetched:', result);
      return result;
    },
    staleTime: 30 * 1000, // Cache for only 30 seconds instead of 5 minutes
    gcTime: 60 * 1000, // Garbage collect after 1 minute
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

      console.log('🔧 Admin updating show_mock_data setting to:', showMockData);

      const { error } = await supabase
        .from('app_settings')
        .update({ 
          setting_value: showMockData,
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', 'show_mock_data');

      if (error) {
        console.error('❌ Error updating app settings:', error);
        throw error;
      }

      console.log('✅ App settings updated successfully');
    },
    onSuccess: () => {
      console.log('🔄 Invalidating app settings cache...');
      // Invalidate and refetch app settings immediately
      queryClient.invalidateQueries({ queryKey: ['appSettings'] });
      // Also invalidate any cached equipment data to force refresh
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
  });
};
