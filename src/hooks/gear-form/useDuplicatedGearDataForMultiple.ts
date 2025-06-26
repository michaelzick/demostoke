
import { useEffect } from "react";

interface UseDuplicatedGearDataForMultipleProps {
  setGearName: (value: string) => void;
  setGearType: (value: string) => void;
  setDescription: (value: string) => void;
  setZipCode: (value: string) => void;
  setMeasurementUnit: (value: string) => void;
  setSize: (value: string) => void;
  setSkillLevel: (value: string) => void;
  setPricePerDay: (value: string) => void;
  setPricePerHour: (value: string) => void;
  setPricePerWeek: (value: string) => void;
  setDamageDeposit: (value: string) => void;
  setImageUrls: (value: string[]) => void;
  setUseImageUrls: (value: boolean) => void;
}

export const useDuplicatedGearDataForMultiple = ({
  setGearName,
  setGearType,
  setDescription,
  setZipCode,
  setMeasurementUnit,
  setSize,
  setSkillLevel,
  setPricePerDay,
  setPricePerHour,
  setPricePerWeek,
  setDamageDeposit,
  setImageUrls,
  setUseImageUrls,
}: UseDuplicatedGearDataForMultipleProps) => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const duplicateFrom = params.get('duplicateFrom');
    
    if (duplicateFrom) {
      try {
        const duplicatedData = JSON.parse(decodeURIComponent(duplicateFrom));
        console.log('Loading duplicated gear data:', duplicatedData);
        
        // Set basic info
        setGearName(duplicatedData.name || "");
        setGearType(duplicatedData.category || "");
        setDescription(duplicatedData.description || "");
        setZipCode(duplicatedData.location?.zip || "");
        
        // Set size directly from duplicated data
        setSize(duplicatedData.specifications?.size || "");
        
        // Extract measurement unit from size string if available
        const sizeString = duplicatedData.specifications?.size || "";
        if (sizeString.includes("inches") || sizeString.includes("in") || sizeString.includes('"')) {
          setMeasurementUnit("inches");
        } else if (sizeString.includes("cm") || sizeString.includes("centimeters")) {
          setMeasurementUnit("centimeters");
        } else {
          setMeasurementUnit("inches"); // default
        }
        
        // Set skill level
        setSkillLevel(duplicatedData.specifications?.suitable || "");
        
        // Set individual price fields
        setPricePerDay(duplicatedData.price_per_day?.toString() || "");
        setPricePerHour(duplicatedData.price_per_hour?.toString() || "");
        setPricePerWeek(duplicatedData.price_per_week?.toString() || "");
        setDamageDeposit(duplicatedData.damage_deposit?.toString() || "0");
        
        // Set image URLs
        if (duplicatedData.images && duplicatedData.images.length > 0) {
          setImageUrls(duplicatedData.images);
          setUseImageUrls(true);
        } else if (duplicatedData.image_url) {
          setImageUrls([duplicatedData.image_url]);
          setUseImageUrls(true);
        }
        
        console.log('Duplicated data loaded successfully');
      } catch (error) {
        console.error('Error parsing duplicated gear data:', error);
      }
    }
  }, []); // Run once on component mount
};
