
import { supabase } from "@/integrations/supabase/client";
import { UserEquipment } from "@/types/equipment";

export const updateEquipmentInDatabase = async (
  equipment: UserEquipment,
  equipmentData: Record<string, unknown>,
  userId: string
) => {

  // CRITICAL: Never update user_id to preserve original ownership
  // Remove user_id from equipmentData if it exists to ensure we don't change ownership
  if ('user_id' in equipmentData) {
    delete equipmentData.user_id;
  }

  // Validate that we have required data
  if (!equipment.id) {
    throw new Error('Equipment ID is required');
  }

  if (!userId) {
    throw new Error('User ID is required');
  }

  // Ensure damage_deposit is properly handled
  if (equipmentData.damage_deposit !== undefined) {
    
    // Convert to number if it's a string
    if (typeof equipmentData.damage_deposit === 'string') {
      equipmentData.damage_deposit = parseFloat(equipmentData.damage_deposit);
    }
    
    // Validate it's a valid number
    if (isNaN(equipmentData.damage_deposit as number) || (equipmentData.damage_deposit as number) < 0) {
      throw new Error('Damage deposit must be a valid positive number');
    }
  }


  // For updates, we only filter by equipment ID since RLS policies will handle access control
  // Admin users can update any equipment, regular users can only update their own
  const { data, error } = await supabase
    .from('equipment')
    .update(equipmentData)
    .eq('id', equipment.id)
    .select()
    .single();

  if (error) {
    console.error('=== DATABASE UPDATE ERROR ===');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error details:', error.details);
    console.error('Error hint:', error.hint);
    console.error('Full error object:', error);
    throw new Error(`Database update failed: ${error.message}`);
  }

  if (!data) {
    throw new Error('No data returned from update operation');
  }

  return data;
};
