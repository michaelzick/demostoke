
import { supabase } from "@/integrations/supabase/client";
import { PricingOption } from "@/hooks/gear-form/types";

export const createEquipmentInDatabase = async (equipmentData: Record<string, unknown>) => {
  console.log('Submitting equipment data:', equipmentData);

  const { data: equipmentResult, error: equipmentError } = await supabase
    .from('equipment')
    .insert([equipmentData])
    .select()
    .single();

  if (equipmentError) {
    console.error('Database error:', equipmentError);
    throw equipmentError;
  }

  console.log('Equipment created successfully:', equipmentResult);
  return equipmentResult;
};

export const createPricingOptionsInDatabase = async (
  equipmentId: string,
  pricingOptions: PricingOption[]
) => {
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

  console.log('Pricing options created successfully');
};
