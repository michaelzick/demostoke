
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
        console.log('Full duplicated equipment object:', JSON.stringify(duplicatedEquipment, null, 2));

        // Map category to gear type (e.g., "snowboards" -> "snowboard")
        const mappedGearType = mapCategoryToGearType(duplicatedEquipment.category);

        // Pre-populate form fields with duplicated equipment data
        setGearName(duplicatedEquipment.name);
        setGearType(mappedGearType || "");
        setDescription(duplicatedEquipment.description || "");
        setZipCode(duplicatedEquipment.location?.zip || "");

        // Set size directly from the equipment size field
        setSize(duplicatedEquipment.specifications?.size || duplicatedEquipment.size || "");

        // Set measurement unit for non-mountain bikes
        const isMountainBike = mappedGearType === "mountain-bike";
        if (!isMountainBike) {
          // Extract measurement unit from size string if available
          const sizeString = duplicatedEquipment.specifications?.size || duplicatedEquipment.size || "";
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

        // Map and set skill level - check multiple possible fields
        const rawSkillLevel = duplicatedEquipment.specifications?.suitable || 
                             duplicatedEquipment.suitable_skill_level || 
                             "";
        console.log('Raw skill level from duplicated equipment:', rawSkillLevel);
        console.log('Available skill level fields:', {
          'specifications.suitable': duplicatedEquipment.specifications?.suitable,
          'suitable_skill_level': duplicatedEquipment.suitable_skill_level
        });
        console.log('Mapped gear type:', mappedGearType);
        
        const mappedSkillLevel = mapSkillLevel(rawSkillLevel, mappedGearType);
        console.log('Mapped skill level result:', mappedSkillLevel);
        setSkillLevel(mappedSkillLevel || rawSkillLevel || "");

        // Set individual pricing fields from duplicated data
        setPricePerDay(duplicatedEquipment.price_per_day?.toString() || "");
        
        // Handle price_per_hour - check the actual field and log what we find
        const hourlyPrice = duplicatedEquipment.price_per_hour;
        console.log('Hourly price from duplicated equipment:', hourlyPrice);
        console.log('Hourly price type:', typeof hourlyPrice);
        setPricePerHour(hourlyPrice !== undefined && hourlyPrice !== null ? hourlyPrice.toString() : "");
        
        // Handle price_per_week
        const weeklyPrice = duplicatedEquipment.price_per_week;
        console.log('Weekly price from duplicated equipment:', weeklyPrice);
        setPricePerWeek(weeklyPrice !== undefined && weeklyPrice !== null ? weeklyPrice.toString() : "");

        // Set damage deposit - leave empty if null, undefined, or 0
        const damageDepositValue = duplicatedEquipment.damage_deposit;
        console.log('Damage deposit from duplicated equipment:', damageDepositValue);
        console.log('Damage deposit type:', typeof damageDepositValue);
        // Only set if it has a meaningful value (not null, undefined, 0, or empty string)
        const shouldSetDamageDeposit = damageDepositValue !== undefined && 
                                      damageDepositValue !== null && 
                                      damageDepositValue !== 0 && 
                                      damageDepositValue !== "";
        setDamageDeposit(shouldSetDamageDeposit ? damageDepositValue.toString() : "");

        // Handle image URLs - check for multiple images first, then single image
        if (setImageUrls && setUseImageUrls) {
          let imageUrlsToSet: string[] = [];
          
          // Check for multiple images first (both 'images' array and 'image_urls' array)
          if (duplicatedEquipment.images && Array.isArray(duplicatedEquipment.images) && duplicatedEquipment.images.length > 0) {
            imageUrlsToSet = duplicatedEquipment.images;
            console.log('Setting multiple duplicated image URLs from images array:', imageUrlsToSet);
          }
          // Check for image_urls array
          else if (duplicatedEquipment.image_urls && Array.isArray(duplicatedEquipment.image_urls) && duplicatedEquipment.image_urls.length > 0) {
            imageUrlsToSet = duplicatedEquipment.image_urls;
            console.log('Setting multiple duplicated image URLs from image_urls array:', imageUrlsToSet);
          }
          // Fallback to single image_url
          else if (duplicatedEquipment.image_url) {
            imageUrlsToSet = [duplicatedEquipment.image_url];
            console.log('Setting single duplicated image URL:', duplicatedEquipment.image_url);
          }
          
          if (imageUrlsToSet.length > 0) {
            setImageUrls(imageUrlsToSet);
            setUseImageUrls(true);
            console.log('Final image URLs set:', imageUrlsToSet);
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
        toast({
          title: "Error Loading Duplicated Data",
          description: "There was an issue loading the duplicated gear data. Please try again.",
          variant: "destructive",
        });
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
