import { supabase } from "@/integrations/supabase/client";

// Fetch the AI search preference for the current user
export const getUseAISearchPreference = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    if (!userId) {
      return true; // default when not logged in
    }

    const { data, error } = await supabase
      .from('user_preferences')
      .select('use_ai_search')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('❌ Error fetching user preference:', error);
      return true;
    }

    return data?.use_ai_search ?? true;
  } catch (error) {
    console.error('❌ Exception fetching user preference:', error);
    return true;
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
