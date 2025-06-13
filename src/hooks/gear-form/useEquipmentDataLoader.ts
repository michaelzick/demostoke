
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
  setDamageDeposit?: (value: string) => void;
  setImageUrl?: (value: string) => void;
  setMeasurementUnit?: (value: string) => void;
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
  setDamageDeposit,
  setImageUrl,
  setMeasurementUnit,
}: UseEquipmentDataLoaderProps) => {
  const { data: pricingOptionsData = [] } = usePricingOptions(equipment?.id || "");

  useEffect(() => {
    if (equipment) {
      console.log('Equipment loaded:', equipment);
      const mappedGearType = mapCategoryToGearType(equipment.category);
      console.log('Mapped gear type:', mappedGearType);
      console.log('Original skill level:', equipment.specifications?.suitable);

      setGearName(equipment.name);
      setGearType(mappedGearType);
      setDescription(equipment.description || "");
      setZipCode(equipment.location?.zip || "");
      setDimensions(parseSize(equipment.specifications?.size || ""));

      // Set image URL if available
      if (setImageUrl && equipment.image_url) {
        setImageUrl(equipment.image_url);
      }

      // Set measurement unit for non-mountain bikes
      if (setMeasurementUnit) {
        const isMountainBike = mappedGearType === "mountain-bike";
        if (!isMountainBike) {
          // Extract measurement unit from size string if available
          const sizeString = equipment.specifications?.size || "";
          if (sizeString.includes("inches") || sizeString.includes("in")) {
            setMeasurementUnit("inches");
          } else if (sizeString.includes("cm") || sizeString.includes("centimeters")) {
            setMeasurementUnit("cm");
          } else {
            setMeasurementUnit("inches"); // default
          }
        }
      }

      // Set damage deposit if available and setter provided
      if (setDamageDeposit) {
        // For now, set a default value since damage deposit isn't stored in the current schema
        // This will be updated when we add damage deposit to the database
        setDamageDeposit("100");
      }

      // Map skill level after setting gear type
      const mappedSkillLevel = mapSkillLevel(equipment.specifications?.suitable || "", mappedGearType);
      console.log('Mapped skill level:', mappedSkillLevel);
      setSkillLevel(mappedSkillLevel);
    }
  }, [equipment, setGearName, setGearType, setDescription, setZipCode, setDimensions, setSkillLevel, setDamageDeposit, setImageUrl, setMeasurementUnit]);

  useEffect(() => {
    if (pricingOptionsData.length > 0) {
      const formattedOptions = pricingOptionsData.map(option => ({
        price: option.price.toString(),
        duration: option.duration
      }));
      setPricingOptions(formattedOptions);
    } else if (equipment) {
      // Fallback to default pricing if no options exist
      setPricingOptions([
        { price: equipment.price_per_day.toString(), duration: "day" }
      ]);
    }
  }, [pricingOptionsData, equipment, setPricingOptions]);
};
