
import { useToast } from "@/hooks/use-toast";
import { PricingOption } from "./types";

interface ValidationParams {
  user: any;
  equipment: any;
  pricingOptions: PricingOption[];
  damageDeposit: string;
}

export const useEditGearFormValidation = () => {
  const { toast } = useToast();

  const validateSubmission = ({ user, equipment, pricingOptions, damageDeposit }: ValidationParams): boolean => {
    console.log('=== FORM VALIDATION START ===');
    console.log('Validation data:', { user: !!user, equipment: !!equipment, pricingOptions, damageDeposit });

    if (!user || !equipment) {
      console.error('Missing user or equipment:', { user: !!user, equipment: !!equipment });
      toast({
        title: "Error",
        description: "Authentication error or equipment not found.",
        variant: "destructive",
      });
      return false;
    }

    // Validate pricing options before proceeding
    if (!pricingOptions || pricingOptions.length === 0) {
      console.error('No pricing options provided');
      toast({
        title: "Error",
        description: "At least one pricing option is required.",
        variant: "destructive",
      });
      return false;
    }

    // Validate each pricing option
    for (let i = 0; i < pricingOptions.length; i++) {
      const option = pricingOptions[i];
      if (!option.price || parseFloat(option.price) <= 0) {
        console.error('Invalid pricing option:', option);
        toast({
          title: "Error",
          description: `Price for option ${i + 1} must be greater than 0.`,
          variant: "destructive",
        });
        return false;
      }
    }

    // Validate damage deposit
    if (!damageDeposit || parseFloat(damageDeposit) < 0) {
      console.error('Invalid damage deposit:', damageDeposit);
      toast({
        title: "Error",
        description: "Damage deposit must be a valid number (0 or greater).",
        variant: "destructive",
      });
      return false;
    }

    console.log('Form validation passed');
    return true;
  };

  return { validateSubmission };
};
