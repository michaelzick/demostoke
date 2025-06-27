
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

        // Map and set skill level - try different field names and log for debugging
        const rawSkillLevel = duplicatedEquipment.specifications?.suitable || 
                             duplicatedEquipment.specifications?.skill_level || 
                             "";
        console.log('Raw skill level from duplicated equipment:', rawSkillLevel);
        console.log('Mapped gear type:', mappedGearType);
        
        const mappedSkillLevel = mapSkillLevel(rawSkillLevel, mappedGearType);
        console.log('Mapped skill level result:', mappedSkillLevel);
        setSkillLevel(mappedSkillLevel || rawSkillLevel || "");

        // Set individual pricing fields from duplicated data
        setPricePerDay(duplicatedEquipment.price_per_day?.toString() || "");
        
        // Handle price_per_hour - check multiple possible field names and include 0 values
        const hourlyPrice = duplicatedEquipment.price_per_hour ?? 
                           duplicatedEquipment.hourly_price ?? 
                           duplicatedEquipment.pricePerHour;
        console.log('Hourly price from duplicated equipment:', hourlyPrice);
        setPricePerHour(hourlyPrice !== undefined && hourlyPrice !== null ? hourlyPrice.toString() : "");
        
        // Handle price_per_week - include 0 values  
        const weeklyPrice = duplicatedEquipment.price_per_week ?? 
                           duplicatedEquipment.weekly_price ?? 
                           duplicatedEquipment.pricePerWeek;
        setPricePerWeek(weeklyPrice !== undefined && weeklyPrice !== null ? weeklyPrice.toString() : "");

        // Set damage deposit - leave empty if null/undefined, don't default to "0"
        const damageDepositValue = duplicatedEquipment.damage_deposit ?? 
                                  duplicatedEquipment.damageDeposit;
        console.log('Damage deposit from duplicated equipment:', damageDepositValue);
        setDamageDeposit(damageDepositValue !== undefined && damageDepositValue !== null && damageDepositValue !== "" ? damageDepositValue.toString() : "");

        // Handle image URLs - check for both single image_url and multiple images array
        if (setImageUrls && setUseImageUrls) {
          let imageUrlsToSet: string[] = [];
          
          // Check for multiple images first
          if (duplicatedEquipment.images && Array.isArray(duplicatedEquipment.images) && duplicatedEquipment.images.length > 0) {
            imageUrlsToSet = duplicatedEquipment.images;
            console.log('Setting multiple duplicated image URLs:', imageUrlsToSet);
          }
          // Fallback to single image_url
          else if (duplicatedEquipment.image_url) {
            imageUrlsToSet = [duplicatedEquipment.image_url];
            console.log('Setting single duplicated image URL:', duplicatedEquipment.image_url);
          }
          
          if (imageUrlsToSet.length > 0) {
            setImageUrls(imageUrlsToSet);
            setUseImageUrls(true);
          }
        }

        // Clear the sessionStorage after using it
        sessionStorage.removeItem('duplicatedEquipment');

        let toastDescription = "The form has been pre-filled with the duplicated gear's information. You can now edit and submit it as a new listing.";

        // If there are image URLs, add it to the toast message
        if (duplicatedEquipment.image_url || (duplicatedEquipment.images && duplicatedEquipment.images.length > 0)) {
          toastDescription += " The original images will be used unless you upload new ones.";
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
