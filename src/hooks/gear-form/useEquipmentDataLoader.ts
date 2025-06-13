
import { useEffect } from "react";
import { UserEquipment } from "@/types/equipment";
import { PricingOption } from "./types";
import { mapCategoryToGearType, mapSkillLevel, parseSize } from "@/utils/gearDataMapping";

interface UseEquipmentDataLoaderProps {
  equipment: UserEquipment | undefined;
  setGearName: (value: string) => void;
  setGearType: (value: string) => void;
  setDescription: (value: string) => void;
  setZipCode: (value: string) => void;
  setDimensions: (value: { length: string; width: string; thickness?: string }) => void;
  setSkillLevel: (value: string) => void;
  setPricingOptions: (value: PricingOption[]) => void;
  setDamageDeposit: (value: string) => void;
  setImageUrl?: (value: string) => void;
  setImageUrls?: (value: string[]) => void;
  setMeasurementUnit: (value: string) => void;
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
  setImageUrls,
  setMeasurementUnit,
}: UseEquipmentDataLoaderProps) => {
  useEffect(() => {
    if (equipment) {
      console.log('Loading equipment data:', equipment);
      
      // Set basic info
      setGearName(equipment.name || "");
      setGearType(mapCategoryToGearType(equipment.category) || "");
      setDescription(equipment.description || "");
      setZipCode(equipment.location?.zip || "");

      // Map skill level to the format expected by the form
      const mappedSkillLevel = mapSkillLevel(
        equipment.specifications?.suitable || equipment.suitable_skill_level || "",
        mapCategoryToGearType(equipment.category)
      );
      setSkillLevel(mappedSkillLevel);

      // Parse size information
      const sizeString = equipment.specifications?.size || equipment.size || "";
      const parsedDimensions = parseSize(sizeString);
      setDimensions(parsedDimensions);

      // Determine measurement unit (default to inches for most gear, except mountain bikes)
      const gearType = mapCategoryToGearType(equipment.category);
      const defaultUnit = gearType === "mountain-bike" ? "" : "inches";
      setMeasurementUnit(defaultUnit);

      // Set damage deposit
      const damageDeposit = equipment.damage_deposit || 100;
      setDamageDeposit(damageDeposit.toString());

      // Set image data
      if (setImageUrl && equipment.image_url) {
        setImageUrl(equipment.image_url);
      }
      if (setImageUrls) {
        const images = equipment.images || (equipment.image_url ? [equipment.image_url] : [""]);
        setImageUrls(images);
      }

      // Set pricing options
      if (equipment.pricing_options && equipment.pricing_options.length > 0) {
        const formattedPricingOptions = equipment.pricing_options.map(option => ({
          id: option.id,
          price: option.price.toString(),
          duration: option.duration
        }));
        setPricingOptions(formattedPricingOptions);
      } else {
        // Fallback to price_per_day if no pricing options
        setPricingOptions([{
          price: equipment.price_per_day?.toString() || "",
          duration: "day"
        }]);
      }

      console.log('Equipment data loaded successfully');
    }
  }, [
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
    setImageUrls,
    setMeasurementUnit,
  ]);
};
