
import { supabase } from "@/integrations/supabase/client";
import { PricingOption } from "@/hooks/gear-form/types";

export const updatePricingOptions = async (
  equipmentId: string,
  pricingOptions: PricingOption[]
) => {
  console.log('Updating pricing options for equipment:', equipmentId);
  console.log('Pricing options data:', pricingOptions);

  if (!equipmentId) {
    throw new Error('Equipment ID is required');
  }

  if (!pricingOptions || pricingOptions.length === 0) {
    console.log('No pricing options provided, skipping update');
    return;
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

    console.log('Existing pricing options deleted successfully');

    // Then, insert new pricing options
    const pricingData = pricingOptions.map(option => ({
      equipment_id: equipmentId,
      price: parseFloat(option.price),
      duration: option.duration
    }));

    console.log('Inserting new pricing options:', pricingData);

    const { data, error: insertError } = await supabase
      .from('pricing_options')
      .insert(pricingData)
      .select();

    if (insertError) {
      console.error('Error inserting new pricing options:', insertError);
      throw new Error(`Failed to insert pricing options: ${insertError.message}`);
    }

    console.log('Pricing options updated successfully:', data);
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
    console.log('No pricing options to create');
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

  console.log('Pricing options created successfully:', data);
  return data;
};
