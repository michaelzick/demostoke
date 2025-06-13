
import { supabase } from "@/integrations/supabase/client";
import { PricingOption } from "@/hooks/gear-form/types";

export const updatePricingOptions = async (
  equipmentId: string,
  pricingOptions: PricingOption[]
) => {
  // Delete existing pricing options
  const { error: deleteError } = await supabase
    .from('pricing_options')
    .delete()
    .eq('equipment_id', equipmentId);

  if (deleteError) {
    console.error('Error deleting old pricing options:', deleteError);
    throw deleteError;
  }

  // Insert new pricing options
  const pricingData = pricingOptions.map(option => ({
    equipment_id: equipmentId,
    price: parseFloat(option.price),
    duration: option.duration
  }));

  const { error: pricingError } = await supabase
    .from('pricing_options')
    .insert(pricingData);

  if (pricingError) {
    console.error('Pricing options error:', pricingError);
    throw pricingError;
  }

  console.log('Pricing options updated successfully');
};
