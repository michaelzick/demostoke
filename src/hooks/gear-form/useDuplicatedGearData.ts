
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { PricingOption } from "./types";
import { UserEquipment } from "@/types/equipment";
import { mapCategoryToGearType, mapSkillLevel, parseSize } from "@/utils/gearDataMapping";

interface UseDuplicatedGearDataProps {
  setGearName: (value: string) => void;
  setGearType: (value: string) => void;
  setDescription: (value: string) => void;
  setZipCode: (value: string) => void;
  setMeasurementUnit: (value: string) => void;
  setDimensions: (value: { length: string; width: string; thickness?: string }) => void;
  setRole: (value: string) => void;
  setSkillLevel: (value: string) => void;
  setPricingOptions: (value: PricingOption[]) => void;
  setDamageDeposit: (value: string) => void;
}

export const useDuplicatedGearData = ({
  setGearName,
  setGearType,
  setDescription,
  setZipCode,
  setMeasurementUnit,
  setDimensions,
  setRole,
  setSkillLevel,
  setPricingOptions,
  setDamageDeposit,
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

        // Parse and set dimensions
        const parsedDimensions = parseSize(duplicatedEquipment.specifications?.size || "");
        setDimensions(parsedDimensions);

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

        // Map and set skill level with proper timing
        const mappedSkillLevel = mapSkillLevel(duplicatedEquipment.specifications?.suitable || "", mappedGearType);
        setTimeout(() => {
          setSkillLevel(mappedSkillLevel || "");
        }, 100);

        // Set pricing options from duplicated data
        setPricingOptions([
          { price: duplicatedEquipment.price_per_day.toString(), duration: "day" }
        ]);

        // Set damage deposit from equipment or use default
        const damageDepositValue = duplicatedEquipment.damage_deposit !== undefined && duplicatedEquipment.damage_deposit !== null 
          ? String(duplicatedEquipment.damage_deposit) 
          : "0";
        setDamageDeposit(damageDepositValue);

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
  }, [toast, setGearName, setGearType, setDescription, setZipCode, setMeasurementUnit, setDimensions, setRole, setSkillLevel, setPricingOptions, setDamageDeposit]);

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
