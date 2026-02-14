
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/helpers";
import { useGearFormValidation } from "@/hooks/useGearFormValidation";
import { UserEquipment } from "@/types/equipment";
import { FormData } from "./types";
import { useEditGearFormValidation } from "./useEditGearFormValidation";
import { useEditGearImageHandling } from "./useEditGearImageHandling";
import { useEditGearLocationHandling } from "./useEditGearLocationHandling";
import { useEditGearDatabaseUpdate } from "./useEditGearDatabaseUpdate";
import { buildGearPath } from "@/utils/gearUrl";

interface UseEditGearFormSubmissionProps {
  equipment: UserEquipment | null | undefined;
  gearName: string;
  gearType: string;
  description: string;
  address: string; // Changed from zipCode to address
  measurementUnit: string;
  size: string;
  skillLevel: string;
  images: File[];
  pricePerDay: string;
  pricePerHour: string;
  pricePerWeek: string;
  damageDeposit: string;
  imageUrl: string;
  useImageUrl: boolean;
}

export const useEditGearFormSubmission = ({
  equipment,
  gearName,
  gearType,
  description,
  address, // Changed from zipCode to address
  measurementUnit,
  size,
  skillLevel,
  images,
  pricePerDay,
  pricePerHour,
  pricePerWeek,
  damageDeposit,
  imageUrl,
  useImageUrl,
}: UseEditGearFormSubmissionProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { validateForm } = useGearFormValidation();
  const { validateSubmission } = useEditGearFormValidation();
  const { handleImageProcessing } = useEditGearImageHandling();
  const { handleLocationUpdate } = useEditGearLocationHandling();
  const { updateGearInDatabase } = useEditGearDatabaseUpdate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('=== FORM SUBMISSION START ===');

    // Create pricingOptions array for validation - include empty values to allow clearing
    const pricingOptions = [
      { price: pricePerDay, duration: "day" }
    ];
    // Include hour/week pricing even if empty (for validation to allow clearing)
    pricingOptions.push({ price: pricePerHour, duration: "hour" });
    pricingOptions.push({ price: pricePerWeek, duration: "week" });

    // Initial validation
    if (!validateSubmission({ user, equipment, pricingOptions, damageDeposit })) {
      return;
    }

    // Use the validation hook to validate the form
    const formData: FormData = {
      gearName,
      gearType,
      description,
      address, // Changed from zipCode to address
      measurementUnit,
      size,
      skillLevel,
      pricingOptions,
      damageDeposit,
      imageUrl,
      useImageUrl,
      role: "private-party", // Default role for gear listing
    };

    if (!validateForm(formData)) {
      console.error('Form validation failed');
      return;
    }

    setIsSubmitting(true);

    try {
      // Handle image processing
      const finalImageUrl = await handleImageProcessing({
        useImageUrl,
        imageUrl,
        images,
        currentImageUrl: equipment!.image_url,
        userId: user!.id
      });

      // Handle location updates
      const currentAddress = equipment!.location?.address || ''; // Changed from zip to address
      const coordinates = await handleLocationUpdate({ address, currentAddress }); // Changed zipCode to address

      // Update database with individual price fields - pass empty strings to allow clearing
      await updateGearInDatabase({
        equipment: equipment!,
        userId: user!.id,
        gearName,
        gearType,
        description,
        address, // Changed from zipCode to address
        coordinates,
        size,
        skillLevel,
        pricePerDay,
        pricePerHour: pricePerHour, // Don't filter empty - let prepareEquipmentData handle it
        pricePerWeek: pricePerWeek, // Don't filter empty - let prepareEquipmentData handle it
        damageDeposit,
        finalImageUrl
      });

      console.log('=== FORM SUBMISSION SUCCESS ===');

      toast({
        title: "Equipment Updated",
        description: `${gearName} has been successfully updated.`,
      });

      navigate(
        buildGearPath({
          id: equipment!.id,
          name: gearName,
          size,
        }),
      );

    } catch (error) {
      console.error('=== FORM SUBMISSION ERROR ===');
      console.error('Error updating equipment:', error);
      
      // Provide more detailed error information
      let errorMessage = "Failed to update equipment. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
        console.error('Detailed error:', error);
        console.error('Error stack:', error.stack);
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(
      buildGearPath({
        id: equipment!.id,
        name: equipment!.name,
        size: equipment?.specifications?.size,
      }),
    );
  };

  return {
    handleSubmit,
    handleCancel,
    isSubmitting,
  };
};
