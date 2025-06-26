
import { useToast } from "@/hooks/use-toast";
import { FormData, PricingOption } from "@/hooks/gear-form/types";

export const useGearFormValidation = () => {
  const { toast } = useToast();

  const validateForm = (formData: FormData): boolean => {
    const {
      gearName,
      gearType,
      description,
      zipCode,
      dimensions,
      skillLevel,
      damageDeposit,
      pricingOptions,
      imageUrl,
      useImageUrl,
      role
    } = formData;

    // Validate required fields
    if (!gearName.trim()) {
      toast({
        title: "Validation Error",
        description: "Gear name is required.",
        variant: "destructive",
      });
      return false;
    }

    if (!gearType) {
      toast({
        title: "Validation Error",
        description: "Gear type is required.",
        variant: "destructive",
      });
      return false;
    }

    if (!description.trim()) {
      toast({
        title: "Validation Error",
        description: "Description is required.",
        variant: "destructive",
      });
      return false;
    }

    if (!zipCode.trim()) {
      toast({
        title: "Validation Error",
        description: "Zip code is required.",
        variant: "destructive",
      });
      return false;
    }

    // Validate zip code format (5 digits)
    const zipCodeRegex = /^\d{5}$/;
    if (!zipCodeRegex.test(zipCode.trim())) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid 5-digit zip code.",
        variant: "destructive",
      });
      return false;
    }

    // Check if gear type requires dimensions or sizes
    const isBikeType = gearType === "mountain-bike" || gearType === "e-bike";

    if (!isBikeType) {
      // For non-bike types, validate dimensions
      if (!dimensions.length.trim()) {
        toast({
          title: "Validation Error",
          description: "Length is required.",
          variant: "destructive",
        });
        return false;
      }
    }

    if (!skillLevel) {
      toast({
        title: "Validation Error",
        description: "Skill level is required.",
        variant: "destructive",
      });
      return false;
    }

    // Validate pricing options (only check non-empty values)
    if (!pricingOptions || pricingOptions.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one pricing option is required.",
        variant: "destructive",
      });
      return false;
    }

    // Find the daily pricing option
    const dailyPricing = pricingOptions.find(option => option.duration === "day");
    if (!dailyPricing || !dailyPricing.price.trim()) {
      toast({
        title: "Validation Error",
        description: "Daily price is required.",
        variant: "destructive",
      });
      return false;
    }

    // Validate that non-empty pricing options have valid positive values
    for (const option of pricingOptions) {
      if (option.price.trim() !== '') { // Only validate non-empty values
        const price = parseFloat(option.price);
        if (isNaN(price) || price <= 0) {
          toast({
            title: "Validation Error",
            description: `${option.duration.charAt(0).toUpperCase() + option.duration.slice(1)} price must be a positive number.`,
            variant: "destructive",
          });
          return false;
        }
      }
    }

    // Validate damage deposit if provided
    if (damageDeposit.trim()) {
      const deposit = parseFloat(damageDeposit);
      if (isNaN(deposit) || deposit < 0) {
        toast({
          title: "Validation Error",
          description: "Damage deposit must be a valid positive number or zero.",
          variant: "destructive",
        });
        return false;
      }
    }

    // Validate image URL if using URL option
    if (useImageUrl && !imageUrl.trim()) {
      toast({
        title: "Validation Error",
        description: "Image URL is required when using URL option.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  return { validateForm };
};
