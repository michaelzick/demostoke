
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
      console.log('Loading equipment data for editing:', equipment);
      const mappedGearType = mapCategoryToGearType(equipment.category);
      
      // Set all form fields - making sure they're editable
      setGearName(equipment.name || "");
      setGearType(mappedGearType || "");
      setDescription(equipment.description || "");
      setZipCode(equipment.location?.zip || "");
      
      // Parse and set dimensions
      const parsedDimensions = parseSize(equipment.specifications?.size || "");
      setDimensions(parsedDimensions);

      // Set image URL if available and setter provided
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

      // Set damage deposit - use a default value since it's not in the current schema
      if (setDamageDeposit) {
        setDamageDeposit("100");
      }

      // Map and set skill level
      const mappedSkillLevel = mapSkillLevel(equipment.specifications?.suitable || "", mappedGearType);
      setSkillLevel(mappedSkillLevel || "");
      
      console.log('Equipment data loaded successfully for editing');
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
