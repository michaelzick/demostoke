import { supabase } from "@/integrations/supabase/client";

export const generateGearDescription = async (gearName: string, gearType?: string): Promise<string | null> => {
  try {
    
    const { data, error } = await supabase.functions.invoke('generate-description', {
      body: { gearName, gearType }
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(`Function error: ${error.message}`);
    }

    if (!data?.description) {
      console.error('No description returned from AI service');
      throw new Error('No description generated');
    }

    return data.description;
  } catch (err) {
    console.error('Error calling generate-description function:', err);
    throw err;
  }
};
