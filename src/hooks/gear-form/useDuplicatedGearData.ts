
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { UserEquipment } from "@/types/equipment";
import { mapCategoryToGearType, mapSkillLevel, parseSize } from "@/utils/gearDataMapping";

interface UseDuplicatedGearDataProps {
  setGearName: (value: string) => void;
  setGearType: (value: string) => void;
  setDescription: (value: string) => void;
  setZipCode: (value: string) => void;
  setMeasurementUnit: (value: string) => void;
  setSize: (value: string) => void;
  setRole: (value: string) => void;
  setSkillLevel: (value: string) => void;
  setPricePerDay: (value: string) => void;
  setPricePerHour: (value: string) => void;
  setPricePerWeek: (value: string) => void;
  setDamageDeposit: (value: string) => void;
  setImageUrls?: (urls: string[]) => void;
  setUseImageUrls?: (value: boolean) => void;
}

export const useDuplicatedGearData = ({
  setGearName,
  setGearType,
  setDescription,
  setZipCode,
  setMeasurementUnit,
  setSize,
  setRole,
  setSkillLevel,
  setPricePerDay,
  setPricePerHour,
  setPricePerWeek,
  setDamageDeposit,
  setImageUrls,
  setUseImageUrls,
}: UseDuplicatedGearDataProps) => {
  const { toast } = useToast();

  useEffect(() => {
    const duplicatedEquipmentJSON = sessionStorage.getItem('duplicatedEquipment');
    if (duplicatedEquipmentJSON) {
      try {
        const duplicatedEquipment: UserEquipment = JSON.parse(duplicatedEquipmentJSON);

        console.log('Loading duplicated equipment data:', duplicatedEquipment);

        // Map category to gear type (e.g., "snowboards" -> "snowboard")
        const mappedGearType = mapCategoryToGearType(duplicatedEquipment.category);

        // Pre-populate form fields with duplicated equipment data
        setGearName(duplicatedEquipment.name);
        setGearType(mappedGearType || "");
        setDescription(duplicatedEquipment.description || "");
        setZipCode(duplicatedEquipment.location?.zip || "");

        // Set size directly from the equipment size field
        setSize(duplicatedEquipment.specifications?.size || "");

        // Set measurement unit for non-mountain bikes
        const isMountainBike = mappedGearType === "mountain-bike";
        if (!isMountainBike) {
          // Extract measurement unit from size string if available
          const sizeString = duplicatedEquipment.specifications?.size || "";
          if (sizeString.includes("inches") || sizeString.includes("in") || sizeString.includes('"')) {
            setMeasurementUnit("inches");
          } else if (sizeString.includes("cm") || sizeString.includes("centimeters")) {
            setMeasurementUnit("centimeters");
          } else {
            setMeasurementUnit("inches"); // default
          }
        }

        // Set role (default for duplicated gear)
        setRole("private-party");

        // Map and set skill level immediately without timeout
        const mappedSkillLevel = mapSkillLevel(duplicatedEquipment.specifications?.suitable || "", mappedGearType);
        console.log('Setting skill level:', mappedSkillLevel);
        setSkillLevel(mappedSkillLevel || "");

        // Set individual pricing fields from duplicated data
        setPricePerDay(duplicatedEquipment.price_per_day.toString());
        
        // Handle price_per_hour - include 0 values
        const hourlyPrice = duplicatedEquipment.price_per_hour;
        setPricePerHour(hourlyPrice !== undefined && hourlyPrice !== null ? hourlyPrice.toString() : "");
        
        // Handle price_per_week - include 0 values  
        const weeklyPrice = duplicatedEquipment.price_per_week;
        setPricePerWeek(weeklyPrice !== undefined && weeklyPrice !== null ? weeklyPrice.toString() : "");

        // Set damage deposit - include 0 values
        const damageDepositValue = duplicatedEquipment.damage_deposit;
        setDamageDeposit(damageDepositValue !== undefined && damageDepositValue !== null ? damageDepositValue.toString() : "0");

        // Handle image URL if available and setters are provided
        if (duplicatedEquipment.image_url && setImageUrls && setUseImageUrls) {
          console.log('Setting duplicated image URL:', duplicatedEquipment.image_url);
          setImageUrls([duplicatedEquipment.image_url]);
          setUseImageUrls(true);
        }

        // Clear the sessionStorage after using it
        sessionStorage.removeItem('duplicatedEquipment');

        let toastDescription = "The form has been pre-filled with the duplicated gear's information. You can now edit and submit it as a new listing.";

        // If there's an image URL, add it to the toast message
        if (duplicatedEquipment.image_url) {
          toastDescription += " The original image will be used unless you upload a new one.";
        }

        toast({
          title: "Duplicated Gear Data Loaded",
          description: toastDescription,
        });
      } catch (error) {
        console.error("Error parsing duplicated equipment data:", error);
      }
    }
  }, [toast, setGearName, setGearType, setDescription, setZipCode, setMeasurementUnit, setSize, setRole, setSkillLevel, setPricePerDay, setPricePerHour, setPricePerWeek, setDamageDeposit, setImageUrls, setUseImageUrls]);

  // Return the duplicated equipment data so it can be used by the form
  const getDuplicatedGearData = () => {
    const duplicatedEquipmentJSON = sessionStorage.getItem('duplicatedEquipment');
    if (duplicatedEquipmentJSON) {
      try {
        return JSON.parse(duplicatedEquipmentJSON) as UserEquipment;
      } catch (error) {
        console.error("Error parsing duplicated equipment data:", error);
        return null;
      }
    }
    return null;
  };

  return { getDuplicatedGearData };
};
