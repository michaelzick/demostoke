
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
        .eq('setting_key', 'show_mock_data');

      if (error) {
        console.error('❌ Error fetching app settings:', error);
        console.log('🔄 Using default fallback values');
        return { 
          show_mock_data: true
        };
      }

      const settings = {
        show_mock_data: true // default
      };

      data?.forEach(setting => {
        if (setting.setting_key === 'show_mock_data') {
          settings.show_mock_data = setting.setting_value === true;
        }
      });
      
      console.log('✅ App settings fetched:', settings);
      return settings;
    },
    staleTime: 30 * 1000, // Cache for only 30 seconds instead of 5 minutes
    gcTime: 60 * 1000, // Garbage collect after 1 minute
  });
};

export const useUpdateAppSettings = () => {
  const queryClient = useQueryClient();
  const { isAdmin } = useIsAdmin();

  return useMutation({
    mutationFn: async (settings: { showMockData?: boolean }) => {
      if (!isAdmin) {
        throw new Error('Only admins can update app settings');
      }

      console.log('🔧 Admin updating app settings:', settings);

      const updates = [];

      if (settings.showMockData !== undefined) {
        updates.push(
          supabase
            .from('app_settings')
            .update({ 
              setting_value: settings.showMockData,
              updated_at: new Date().toISOString()
            })
            .eq('setting_key', 'show_mock_data')
        );
      }

      const results = await Promise.all(updates);
      
      for (const result of results) {
        if (result.error) {
          console.error('❌ Error updating app settings:', result.error);
          throw result.error;
        }
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
