
import { supabase } from "@/integrations/supabase/client";

// Get global app setting for mock data
export const getShowMockDataSetting = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('setting_value')
      .eq('setting_key', 'show_mock_data')
      .single();

    if (error) {
      console.error('❌ Error fetching app setting:', error);
      return true; // Default to mock data if error
    }

    const useMockData = data?.setting_value === true;
    return useMockData;
  } catch (error) {
    console.error('❌ Exception fetching app setting:', error);
    return true; // Default to mock data if error
  }
};

// Get global app setting for AI search usage
export const getUseAISearchSetting = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('setting_value')
      .eq('setting_key', 'use_ai_search')
      .single();

    if (error) {
      console.error('❌ Error fetching app setting:', error);
      return true;
    }

    const useAI = data?.setting_value === true;
    return useAI;
  } catch (error) {
    console.error('❌ Exception fetching app setting:', error);
    return true;
  }
};
