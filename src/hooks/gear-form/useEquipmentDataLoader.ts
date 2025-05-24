
import { useEffect } from "react";
import { UserEquipment } from "@/types/equipment";
import { mapCategoryToGearType, mapSkillLevel, parseSize } from "@/utils/gearDataMapping";
import { PricingOption } from "./types";

interface UseEquipmentDataLoaderProps {
  equipment: UserEquipment | null | undefined;
  setGearName: (value: string) => void;
  setGearType: (value: string) => void;
  setDescription: (value: string) => void;
  setZipCode: (value: string) => void;
  setDimensions: (value: { length: string; width: string }) => void;
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
  useEffect(() => {
    if (equipment) {
      console.log('Equipment loaded:', equipment);
      const mappedGearType = mapCategoryToGearType(equipment.category);
      console.log('Mapped gear type:', mappedGearType);
      console.log('Original skill level:', equipment.suitable_skill_level);
      
      setGearName(equipment.name);
      setGearType(mappedGearType);
      setDescription(equipment.description || "");
      setZipCode(equipment.location_name || "");
      setDimensions(parseSize(equipment.size || ""));
      
      // Map skill level after setting gear type
      const mappedSkillLevel = mapSkillLevel(equipment.suitable_skill_level || "", mappedGearType);
      console.log('Mapped skill level:', mappedSkillLevel);
      setSkillLevel(mappedSkillLevel);
      
      setPricingOptions([
        { id: "1", price: equipment.price_per_day.toString(), duration: "day" }
      ]);
    }
  }, [equipment, setGearName, setGearType, setDescription, setZipCode, setDimensions, setSkillLevel, setPricingOptions]);
};
