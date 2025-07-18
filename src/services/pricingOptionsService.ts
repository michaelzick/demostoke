
import { supabase } from "@/integrations/supabase/client";
import { PricingOption } from "@/hooks/gear-form/types";

export const updatePricingOptions = async (
  equipmentId: string,
  pricingOptions: PricingOption[]
) => {

  if (!equipmentId) {
    throw new Error('Equipment ID is required');
  }

  if (!pricingOptions || pricingOptions.length === 0) {
    // No pricing options to update
    return;
  }

  // Validate pricing options
  for (let i = 0; i < pricingOptions.length; i++) {
    const option = pricingOptions[i];
    if (!option.price || isNaN(parseFloat(option.price))) {
      throw new Error(`Invalid price for option ${i + 1}: ${option.price}`);
    }
    if (!option.duration) {
      throw new Error(`Duration is required for option ${i + 1}`);
    }
  }

  try {
    // First, delete existing pricing options
    const { error: deleteError } = await supabase
      .from('pricing_options')
      .delete()
      .eq('equipment_id', equipmentId);

    if (deleteError) {
      console.error('Error deleting existing pricing options:', deleteError);
      throw new Error(`Failed to delete existing pricing options: ${deleteError.message}`);
    }


    // Then, insert new pricing options
    const pricingData = pricingOptions.map((option, index) => {
      const price = parseFloat(option.price);
      
      return {
        equipment_id: equipmentId,
        price: price,
        duration: option.duration
      };
    });


    const { data, error: insertError } = await supabase
      .from('pricing_options')
      .insert(pricingData)
      .select();

    if (insertError) {
      console.error('Error inserting new pricing options:', insertError);
      console.error('Insert error details:', {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint
      });
      throw new Error(`Failed to insert pricing options: ${insertError.message}`);
    }

    return data;

  } catch (error) {
    console.error('Error in updatePricingOptions:', error);
    throw error;
  }
};

export const createPricingOptions = async (
  equipmentId: string,
  pricingOptions: PricingOption[]
) => {
  if (!pricingOptions || pricingOptions.length === 0) {
    return;
  }

  const pricingData = pricingOptions.map(option => ({
    equipment_id: equipmentId,
    price: parseFloat(option.price),
    duration: option.duration
  }));

  const { data, error } = await supabase
    .from('pricing_options')
    .insert(pricingData)
    .select();

  if (error) {
    console.error('Error creating pricing options:', error);
    throw error;
  }

  return data;
};
