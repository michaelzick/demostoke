
import { prepareEquipmentData } from "@/utils/equipmentDataPreparation";
import { updateEquipmentInDatabase } from "@/services/equipmentUpdateService";
import { UserEquipment } from "@/types/equipment";

interface DatabaseUpdateParams {
  equipment: UserEquipment;
  userId: string;
  gearName: string;
  gearType: string;
  description: string;
  zipCode: string;
  coordinates: { lat: number; lng: number } | null;
  size: string;
  skillLevel: string;
  pricePerDay: string;
  pricePerHour?: string;
  pricePerWeek?: string;
  damageDeposit: string;
  finalImageUrl: string;
}

export const useEditGearDatabaseUpdate = () => {
  const updateGearInDatabase = async (params: DatabaseUpdateParams) => {
    const {
      equipment,
      userId,
      gearName,
      gearType,
      description,
      zipCode,
      coordinates,
      size,
      skillLevel,
      pricePerDay,
      pricePerHour,
      pricePerWeek,
      damageDeposit,
      finalImageUrl
    } = params;

    console.log('Preparing equipment data with individual price fields:', {
      pricePerDay,
      pricePerHour,
      pricePerWeek,
      damageDeposit,
      finalImageUrl
    });

    const equipmentData = prepareEquipmentData({
      gearName,
      gearType,
      description,
      zipCode,
      coordinates,
      size,
      skillLevel,
      pricePerDay,
      pricePerHour,
      pricePerWeek,
      finalImageUrl,
      damageDeposit,
    });

    console.log('Final equipment data to save:', equipmentData);

    // Update equipment in database
    console.log('=== UPDATING EQUIPMENT ===');
    const updatedEquipment = await updateEquipmentInDatabase(equipment, equipmentData, userId);
    console.log('Equipment update completed:', updatedEquipment);

    return updatedEquipment;
  };

  return { updateGearInDatabase };
};
