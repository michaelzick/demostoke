
import { useEffect } from "react";

interface UseDuplicatedGearDataForMultipleProps {
  setGearName: (value: string) => void;
  setGearType: (value: string) => void;
  setDescription: (value: string) => void;
  setZipCode: (value: string) => void;
  setMeasurementUnit: (value: string) => void;
  setDimensions: (value: { length: string; width: string; thickness?: string }) => void;
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
  setDimensions,
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
        
        // Set dimensions and measurement unit
        if (duplicatedData.specifications?.size) {
          const sizeString = duplicatedData.specifications.size;
          // Parse dimensions from size string
          const dimensionMatch = sizeString.match(/(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)(?:\s*x\s*(\d+(?:\.\d+)?))?\s*(inches|in|cm|centimeters)?/i);
          if (dimensionMatch) {
            setDimensions({
              length: dimensionMatch[1] || "",
              width: dimensionMatch[2] || "",
              thickness: dimensionMatch[3] || ""
            });
            const unit = dimensionMatch[4];
            if (unit && (unit.includes('cm') || unit.includes('centimeter'))) {
              setMeasurementUnit('centimeters');
            } else {
              setMeasurementUnit('inches');
            }
          }
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
