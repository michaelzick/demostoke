
import { useEffect, useRef } from "react";
import { UserEquipment } from "@/types/equipment";
import { mapCategoryToGearType, parseSize } from "@/utils/gearDataMapping";

interface UseEquipmentDataLoaderProps {
  equipment: UserEquipment | null | undefined;
  setGearName: (value: string) => void;
  setGearType: (value: string) => void;
  setDescription: (value: string) => void;
  setZipCode: (value: string) => void;
  setDimensions: (value: { length: string; width: string; thickness?: string }) => void;
  setSkillLevel: (value: string) => void;
  setPricePerDay: (value: string) => void;
  setPricePerHour?: (value: string) => void;
  setPricePerWeek?: (value: string) => void;
  setDamageDeposit?: (value: string) => void;
  setImageUrl?: (value: string) => void;
  setMeasurementUnit?: (value: string) => void;
  setSelectedSkillLevels?: (skillLevels: string[]) => void;
  setSelectedSizes?: (sizes: string[]) => void;
}

export const useEquipmentDataLoader = ({
  equipment,
  setGearName,
  setGearType,
  setDescription,
  setZipCode,
  setDimensions,
  setSkillLevel,
  setPricePerDay,
  setPricePerHour,
  setPricePerWeek,
  setDamageDeposit,
  setImageUrl,
  setMeasurementUnit,
  setSelectedSkillLevels,
  setSelectedSizes,
}: UseEquipmentDataLoaderProps) => {
  const equipmentDataLoadedRef = useRef(false);

  // Load equipment basic data
  useEffect(() => {
    if (equipment && !equipmentDataLoadedRef.current) {
      console.log('Loading equipment data for editing (one-time):', equipment);
      const mappedGearType = mapCategoryToGearType(equipment.category);
      
      // Set all form fields - making sure they're editable
      setGearName(equipment.name || "");
      setGearType(mappedGearType || "");
      setDescription(equipment.description || "");
      setZipCode(equipment.location?.zip || "");
      
      // Parse and set dimensions
      const parsedDimensions = parseSize(equipment.specifications?.size || "");
      setDimensions(parsedDimensions);

      // For bike types, also populate selectedSizes from the size data
      const isBikeType = mappedGearType === "mountain-bike" || mappedGearType === "e-bike";
      if (isBikeType && setSelectedSizes && equipment.specifications?.size) {
        const existingSizes = equipment.specifications.size.split(", ").map(size => size.trim()).filter(size => size !== "");
        console.log('Loading existing bike sizes for checkboxes:', existingSizes);
        setSelectedSizes(existingSizes);
        // Also ensure dimensions.length reflects the selected sizes for validation
        setDimensions({
          length: existingSizes.join(", "),
          width: "",
          thickness: ""
        });
      }

      // Set individual price fields
      setPricePerDay(equipment.price_per_day?.toString() || "");
      if (setPricePerHour) {
        setPricePerHour(equipment.price_per_hour?.toString() || "");
      }
      if (setPricePerWeek) {
        setPricePerWeek(equipment.price_per_week?.toString() || "");
      }

      // Set image URL if available and setter provided
      if (setImageUrl && equipment.image_url) {
        setImageUrl(equipment.image_url);
      }

      // Set measurement unit for non-mountain bikes
      if (setMeasurementUnit) {
        if (!isBikeType) {
          // Extract measurement unit from size string if available
          const sizeString = equipment.specifications?.size || "";
          if (sizeString.includes("inches") || sizeString.includes("in") || sizeString.includes('"')) {
            setMeasurementUnit("inches");
          } else if (sizeString.includes("cm") || sizeString.includes("centimeters")) {
            setMeasurementUnit("centimeters");
          } else {
            setMeasurementUnit("inches"); // default
          }
        }
      }

      // Set damage deposit - handle all numeric values including 0
      if (setDamageDeposit) {
        console.log('Setting damage deposit from equipment:', equipment.damage_deposit);
        console.log('Type of damage deposit:', typeof equipment.damage_deposit);
        
        // Convert to string, handling 0 as a valid value
        const damageDepositValue = equipment.damage_deposit !== null && equipment.damage_deposit !== undefined 
          ? String(equipment.damage_deposit) 
          : "0";
        
        console.log('Final damage deposit value being set:', damageDepositValue);
        setDamageDeposit(damageDepositValue);
      }

      // Handle skill levels - parse multiple skill levels from the suitable field
      if (equipment.specifications?.suitable) {
        const skillLevels = equipment.specifications.suitable.split(", ").map(level => level.trim());
        setSkillLevel(skillLevels.join(", "));
        
        // Set selected skill levels if the setter is provided
        if (setSelectedSkillLevels) {
          setSelectedSkillLevels(skillLevels);
        }
      } else {
        setSkillLevel("");
        if (setSelectedSkillLevels) {
          setSelectedSkillLevels([]);
        }
      }
      
      // Mark equipment data as loaded
      equipmentDataLoadedRef.current = true;
      console.log('Equipment basic data loaded successfully for editing - form is now editable');
    }
  }, [equipment]); // Depend on the entire equipment object to catch any changes
};
