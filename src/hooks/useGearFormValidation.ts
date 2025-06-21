
import { useToast } from "@/hooks/use-toast";
import { PricingOption, FormData } from "@/hooks/gear-form/types";

export const useGearFormValidation = () => {
  const { toast } = useToast();

  const validateForm = (formData: FormData): boolean => {
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

    // Additional validation for non-bike types
    if (!isBikeType && (!measurementUnit || !dimensions.length || !dimensions.width)) {
      toast({
        title: "Missing Dimensions",
        description: "Please provide all dimension measurements for your gear.",
        variant: "destructive",
      });
      return false;
    }

    // Validate bike size
    if (isBikeType && !dimensions.length) {
      toast({
        title: "Missing Size",
        description: "Please select a size for your bike.",
        variant: "destructive",
      });
      return false;
    }

    // Validate that bike size is valid
    if (isBikeType && !['Small', 'Medium', 'Large', 'XL', 'XXL'].includes(dimensions.length)) {
      toast({
        title: "Invalid Size",
        description: "Please select a valid size for your bike.",
        variant: "destructive",
      });
      return false;
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
