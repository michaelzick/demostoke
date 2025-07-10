
import { useToast } from "@/hooks/use-toast";
import { PricingOption } from "./types";
import type { User } from "@/types";
import type { UserEquipment } from "@/types/equipment";
import { useIsAdmin } from "@/hooks/useUserRole";

interface ValidationParams {
  user: User | null;
  equipment: UserEquipment | null | undefined;
  pricingOptions: PricingOption[];
  damageDeposit: string;
}

export const useEditGearFormValidation = () => {
  const { toast } = useToast();
  const { isAdmin } = useIsAdmin();

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

    // Check if user owns equipment or is admin
    if (equipment.user_id !== user.id && !isAdmin) {
      console.error('User does not own equipment and is not admin');
      toast({
        title: "Access Denied", 
        description: "You don't have permission to edit this equipment.",
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

    // Find the daily pricing option and ensure it's provided
    const dailyPricing = pricingOptions.find(option => option.duration === "day");
    if (!dailyPricing || !dailyPricing.price.trim()) {
      console.error('Daily pricing is required');
      toast({
        title: "Error",
        description: "Daily price is required.",
        variant: "destructive",
      });
      return false;
    }

    // Validate each pricing option - only check non-empty values
    for (let i = 0; i < pricingOptions.length; i++) {
      const option = pricingOptions[i];
      
      // Skip validation for empty optional prices (hour/week can be empty to clear them)
      if (option.price.trim() === '' && option.duration !== 'day') {
        continue;
      }
      
      // Validate non-empty prices
      if (option.price.trim() !== '') {
        const price = parseFloat(option.price);
        if (isNaN(price) || price <= 0) {
          const durationLabel = option.duration === "day" ? "Daily" : 
                               option.duration === "hour" ? "Hourly" : "Weekly";
          console.error('Invalid pricing option:', option);
          toast({
            title: "Error",
            description: `${durationLabel} price must be greater than 0.`,
            variant: "destructive",
          });
          return false;
        }
      }
    }

    // Validate damage deposit - allow empty strings (will be handled as optional)
    if (damageDeposit.trim()) {
      const deposit = parseFloat(damageDeposit);
      if (isNaN(deposit) || deposit < 0) {
        console.error('Invalid damage deposit:', damageDeposit);
        toast({
          title: "Error",
          description: "Damage deposit must be a valid number (0 or greater).",
          variant: "destructive",
        });
        return false;
      }
    }

    console.log('Form validation passed');
    return true;
  };

  return { validateSubmission };
};
