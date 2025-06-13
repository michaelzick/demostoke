
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { DuplicatedGear, PricingOption } from "./types";

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
    const duplicatedGearJSON = sessionStorage.getItem('duplicatedGear');
    if (duplicatedGearJSON) {
      try {
        const duplicatedGear: DuplicatedGear = JSON.parse(duplicatedGearJSON);

        // Pre-populate form fields with duplicated gear data
        setGearName(duplicatedGear.gearName);
        setGearType(duplicatedGear.gearType);
        setDescription(duplicatedGear.description);
        setZipCode(duplicatedGear.zipCode);
        setMeasurementUnit(duplicatedGear.measurementUnit);
        setDimensions(duplicatedGear.dimensions);

        // Set a default role for duplicated gear since it's not in the original data
        setRole("private-party");

        // Important: Set the gear type first, then set the skill level in a separate effect
        // This ensures the skill level options are available when the skill level is set
        setTimeout(() => {
          setSkillLevel(duplicatedGear.skillLevel);
        }, 100);

        // Set pricing options from duplicated data
        setPricingOptions([
          { price: duplicatedGear.price, duration: "day" }
        ]);
        setDamageDeposit(duplicatedGear.damageDeposit);

        // Clear the sessionStorage after using it
        sessionStorage.removeItem('duplicatedGear');

        let toastDescription = "The form has been pre-filled with the duplicated gear's information. You can now edit and submit it as a new listing.";

        // If there's an image URL, add it to the toast message
        if (duplicatedGear.imageUrl) {
          toastDescription += " The original image will be used unless you upload a new one.";
        }

        toast({
          title: "Duplicated Gear Data Loaded",
          description: toastDescription,
        });
      } catch (error) {
        console.error("Error parsing duplicated gear data:", error);
      }
    }
  }, [toast, setGearName, setGearType, setDescription, setZipCode, setMeasurementUnit, setDimensions, setRole, setSkillLevel, setPricingOptions, setDamageDeposit]);

  // Return the duplicated gear data so it can be used by the form
  const getDuplicatedGearData = () => {
    const duplicatedGearJSON = sessionStorage.getItem('duplicatedGear');
    if (duplicatedGearJSON) {
      try {
        return JSON.parse(duplicatedGearJSON) as DuplicatedGear;
      } catch (error) {
        console.error("Error parsing duplicated gear data:", error);
        return null;
      }
    }
    return null;
  };

  return { getDuplicatedGearData };
};
