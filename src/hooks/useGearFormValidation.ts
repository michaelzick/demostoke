
import { useToast } from "@/hooks/use-toast";
import { PricingOption, FormData } from "@/hooks/gear-form/types";

export const useGearFormValidation = () => {
  const { toast } = useToast();

  const validateForm = (formData: FormData & { selectedSizes?: string[] }): boolean => {
    const {
      gearName,
      gearType,
      description,
      zipCode,
      measurementUnit,
      dimensions,
      skillLevel,
      role,
      damageDeposit,
      pricingOptions,
      imageUrl,
      useImageUrl,
      selectedSizes = [],
    } = formData;

    // Validate required fields
    const isBikeType = gearType === "mountain-bike" || gearType === "e-bike";
    
    // Base validation for all gear types
    if (!gearName || !gearType || !description || !zipCode || !skillLevel || !damageDeposit) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields before submitting.",
        variant: "destructive",
      });
      return false;
    }

    // Validate bike size selection - check both selectedSizes array and dimensions.length
    if (isBikeType) {
      const hasSelectedSizes = selectedSizes.length > 0;
      const hasDimensionSizes = dimensions.length && dimensions.length.trim() !== "";
      
      console.log('Bike size validation:', {
        hasSelectedSizes,
        selectedSizes,
        hasDimensionSizes,
        dimensionsLength: dimensions.length
      });
      
      if (!hasSelectedSizes && !hasDimensionSizes) {
        toast({
          title: "Missing Size",
          description: "Please select at least one size for your bike.",
          variant: "destructive",
        });
        return false;
      }
    }

    // Validate that at least one pricing option exists and is filled
    if (pricingOptions.length === 0 || pricingOptions.every(option => !option.price)) {
      toast({
        title: "Missing Pricing",
        description: "Please add at least one pricing option.",
        variant: "destructive",
      });
      return false;
    }

    // Validate image URL if using it
    if (useImageUrl) {
      if (!imageUrl?.trim()) {
        toast({
          title: "Missing Image URL",
          description: "Please provide an image URL or uncheck 'Use image URL'.",
          variant: "destructive",
        });
        return false;
      }

      try {
        new URL(imageUrl);
      } catch (e) {
        toast({
          title: "Invalid Image URL",
          description: "Please enter a valid URL for the image.",
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  };

  return { validateForm };
};
