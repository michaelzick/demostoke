
import { supabase } from "@/integrations/supabase/client";
import { UserEquipment } from "@/types/equipment";

export const updateEquipmentInDatabase = async (
  equipment: UserEquipment,
  equipmentData: any,
  userId: string
) => {
  console.log('Updating equipment data:', equipmentData);
  console.log('Equipment ID:', equipment.id);
  console.log('User ID:', userId);

  // Validate that we have required data
  if (!equipment.id) {
    throw new Error('Equipment ID is required');
  }

  if (!userId) {
    throw new Error('User ID is required');
  }

  const { data, error } = await supabase
    .from('equipment')
    .update(equipmentData)
    .eq('id', equipment.id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Database error details:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error details:', error.details);
    throw new Error(`Database update failed: ${error.message}`);
  }

  if (!data) {
    throw new Error('No data returned from update operation');
  }

  console.log('Equipment updated successfully:', data);
  return data;
};
