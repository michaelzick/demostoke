
import { supabase } from "@/integrations/supabase/client";

// Get global app setting for mock data
export const getShowMockDataSetting = async (): Promise<boolean> => {
  try {
    console.log('🔍 Checking global app setting for show_mock_data...');
    const { data, error } = await supabase
      .from('app_settings')
      .select('setting_value')
      .eq('setting_key', 'show_mock_data')
      .single();

    if (error) {
      console.error('❌ Error fetching app setting:', error);
      console.log('🔄 Defaulting to mock data due to error');
      return true; // Default to mock data if error
    }

    const useMockData = data?.setting_value === true;
    console.log('✅ Global app setting show_mock_data:', useMockData);
    return useMockData;
  } catch (error) {
    console.error('❌ Exception fetching app setting:', error);
    console.log('🔄 Defaulting to mock data due to exception');
    return true; // Default to mock data if error
  }
};

// Get global app setting for AI search usage
export const getUseAISearchSetting = async (): Promise<boolean> => {
  try {
    console.log('🔍 Checking global app setting for use_ai_search...');
    const { data, error } = await supabase
      .from('app_settings')
      .select('setting_value')
      .eq('setting_key', 'use_ai_search')
      .single();

    if (error) {
      console.error('❌ Error fetching app setting:', error);
      console.log('🔄 Defaulting to AI search due to error');
      return true;
    }

    const useAI = data?.setting_value === true;
    console.log('✅ Global app setting use_ai_search:', useAI);
    return useAI;
  } catch (error) {
    console.error('❌ Exception fetching app setting:', error);
    console.log('🔄 Defaulting to AI search due to exception');
    return true;
  }
};
