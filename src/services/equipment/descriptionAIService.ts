import { supabase } from "@/integrations/supabase/client";

export const generateGearDescription = async (gearName: string, gearType?: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-description', {
      body: { gearName, gearType }
    });

    if (error) {
      console.error('Failed to generate description:', error);
      return null;
    }

    return data?.description || null;
  } catch (err) {
    console.error('Error calling generate-description function:', err);
    return null;
  }
};
