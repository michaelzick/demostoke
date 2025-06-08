import { useToast } from "@/hooks/use-toast";

interface PricingOption {
  id: string;
  price: string;
  duration: string;
}

interface FormData {
  gearName: string;
  gearType: string;
  description: string;
  zipCode: string;
  measurementUnit: string;
  dimensions: { length: string; width: string; thickness?: string };
  skillLevel: string;
  damageDeposit: string;
  pricingOptions: PricingOption[];
  imageUrl?: string;
  useImageUrl?: boolean;
}

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
    const isMountainBike = gearType === "mountain-bike";
    
    // Base validation for all gear types
    if (!gearName || !gearType || !description || !zipCode || !skillLevel || !damageDeposit) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields before submitting.",
        variant: "destructive",
      });
      return false;
    }

    // Additional validation for non-mountain bikes
    if (!isMountainBike && (!measurementUnit || !dimensions.length || !dimensions.width)) {
      toast({
        title: "Missing Dimensions",
        description: "Please provide all dimension measurements for your gear.",
        variant: "destructive",
      });
      return false;
    }

    // Validate mountain bike size
    if (isMountainBike && !dimensions.length) {
      toast({
        title: "Missing Size",
        description: "Please select a size for your mountain bike.",
        variant: "destructive",
      });
      return false;
    }

    // Validate that mountain bike size is valid
    if (isMountainBike && !['Small', 'Medium', 'Large', 'XL', 'XXL'].includes(dimensions.length)) {
      toast({
        title: "Invalid Size",
        description: "Please select a valid size for your mountain bike.",
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
