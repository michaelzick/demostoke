import { supabase } from "@/integrations/supabase/client";

// Fetch the AI search preference with proper hierarchy:
// 1. Check global app settings first - if false, return false (admin override)
// 2. If global setting is true, check user preference
// 3. Default to false (non-AI search) for safety
export const getUseAISearchPreference = async (): Promise<boolean> => {
  try {
    // First, check global app setting
    const { data: globalSetting, error: globalError } = await supabase
      .from('app_settings')
      .select('setting_value')
      .eq('setting_key', 'use_ai_search')
      .single();

    if (globalError) {
      console.error('❌ Error fetching global app setting:', globalError);
      return false; // Default to non-AI search if error
    }

    const globalAIEnabled = globalSetting?.setting_value === true;
    
    // If global setting is false, return false regardless of user preference
    if (!globalAIEnabled) {
      console.log('🔒 Global AI search is disabled by admin');
      return false;
    }

    // Global setting allows AI search, now check user preference
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    
    if (!userId) {
      // For logged-out users, use global setting
      return globalAIEnabled;
    }

    const { data, error } = await supabase
      .from('user_preferences')
      .select('use_ai_search')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('❌ Error fetching user preference:', error);
      // If user preference doesn't exist, default to false for safety
      return false;
    }

    // Return user preference (defaults to false if null/undefined)
    return data?.use_ai_search ?? false;
  } catch (error) {
    console.error('❌ Exception fetching AI search preference:', error);
    return false; // Default to non-AI search on any error
  }
};

// Update or insert the AI search preference for the current user
export const setUseAISearchPreference = async (useAI: boolean): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('user_preferences')
    .upsert({
      user_id: user.id,
      use_ai_search: useAI,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });

  if (error) {
    console.error('❌ Error updating user preference:', error);
    throw error;
  }
};
