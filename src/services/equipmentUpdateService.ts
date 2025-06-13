
import { supabase } from "@/integrations/supabase/client";
import { UserEquipment } from "@/types/equipment";

export const updateEquipmentInDatabase = async (
  equipment: UserEquipment,
  equipmentData: any,
  userId: string
) => {
  console.log('Updating equipment data:', equipmentData);

  const { data, error } = await supabase
    .from('equipment')
    .update(equipmentData)
    .eq('id', equipment.id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Database error:', error);
    throw error;
  }

  console.log('Equipment updated successfully:', data);
  return data;
};
