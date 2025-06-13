
import { prepareEquipmentData } from "@/utils/equipmentDataPreparation";
import { updateEquipmentInDatabase } from "@/services/equipmentUpdateService";
import { updatePricingOptions } from "@/services/pricingOptionsService";
import { UserEquipment } from "@/types/equipment";
import { PricingOption } from "./types";

interface DatabaseUpdateParams {
  equipment: UserEquipment;
  userId: string;
  gearName: string;
  gearType: string;
  description: string;
  zipCode: string;
  coordinates: { lat: number; lng: number } | null;
  dimensions: { length: string; width: string; thickness?: string };
  measurementUnit: string;
  skillLevel: string;
  pricingOptions: PricingOption[];
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
      dimensions,
      measurementUnit,
      skillLevel,
      pricingOptions,
      damageDeposit,
      finalImageUrl
    } = params;

    // Prepare equipment data for update - using the first pricing option for the main price
    const firstPricingPrice = pricingOptions.length > 0 ? pricingOptions[0].price : equipment.price_per_day.toString();
    
    console.log('Preparing equipment data with:', {
      firstPricingPrice,
      damageDeposit,
      finalImageUrl
    });

    const equipmentData = prepareEquipmentData({
      gearName,
      gearType,
      description,
      zipCode,
      coordinates,
      dimensions,
      measurementUnit,
      skillLevel,
      firstPricingOptionPrice: firstPricingPrice,
      finalImageUrl,
      damageDeposit,
    });

    console.log('Final equipment data to save:', equipmentData);

    // Update equipment in database
    console.log('=== UPDATING EQUIPMENT ===');
    const updatedEquipment = await updateEquipmentInDatabase(equipment, equipmentData, userId);
    console.log('Equipment update completed:', updatedEquipment);

    // Update pricing options - ensure we have valid pricing options
    console.log('=== UPDATING PRICING OPTIONS ===');
    console.log('Pricing options to save:', pricingOptions);
    
    if (pricingOptions.length > 0) {
      const pricingResult = await updatePricingOptions(equipment.id, pricingOptions);
      console.log('Pricing options update completed:', pricingResult);
    } else {
      console.warn('No pricing options to update');
    }

    return updatedEquipment;
  };

  return { updateGearInDatabase };
};
