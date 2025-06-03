
import { useEffect } from "react";
import { UserEquipment } from "@/types/equipment";
import { mapCategoryToGearType, mapSkillLevel, parseSize } from "@/utils/gearDataMapping";
import { PricingOption } from "./types";
import { usePricingOptions } from "@/hooks/usePricingOptions";

interface UseEquipmentDataLoaderProps {
  equipment: UserEquipment | null | undefined;
  setGearName: (value: string) => void;
  setGearType: (value: string) => void;
  setDescription: (value: string) => void;
  setZipCode: (value: string) => void;
  setDimensions: (value: { length: string; width: string; thickness?: string }) => void;
  setSkillLevel: (value: string) => void;
  setPricingOptions: (value: PricingOption[]) => void;
}

export const useEquipmentDataLoader = ({
  equipment,
  setGearName,
  setGearType,
  setDescription,
  setZipCode,
  setDimensions,
  setSkillLevel,
  setPricingOptions,
}: UseEquipmentDataLoaderProps) => {
  const { data: pricingOptionsData = [] } = usePricingOptions(equipment?.id || "");

  useEffect(() => {
    if (equipment) {
      console.log('Equipment loaded:', equipment);
      const mappedGearType = mapCategoryToGearType(equipment.category);
      console.log('Mapped gear type:', mappedGearType);
      console.log('Original skill level:', equipment.suitable_skill_level);

      setGearName(equipment.name);
      setGearType(mappedGearType);
      setDescription(equipment.description || "");
      setZipCode(equipment.location_zip || "");
      setDimensions(parseSize(equipment.size || ""));

      // Map skill level after setting gear type
      const mappedSkillLevel = mapSkillLevel(equipment.suitable_skill_level || "", mappedGearType);
      console.log('Mapped skill level:', mappedSkillLevel);
      setSkillLevel(mappedSkillLevel);
    }
  }, [equipment, setGearName, setGearType, setDescription, setZipCode, setDimensions, setSkillLevel]);

  useEffect(() => {
    if (pricingOptionsData.length > 0) {
      const formattedOptions = pricingOptionsData.map((option, index) => ({
        id: option.id || (index + 1).toString(),
        price: option.price.toString(),
        duration: option.duration
      }));
      setPricingOptions(formattedOptions);
    } else if (equipment) {
      // Fallback to default pricing if no options exist
      setPricingOptions([
        { id: "1", price: equipment.price_per_day.toString(), duration: "day" }
      ]);
    }
  }, [pricingOptionsData, equipment, setPricingOptions]);
};
