
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/helpers";
import { useGearFormValidation } from "@/hooks/useGearFormValidation";
import { UserEquipment } from "@/types/equipment";
import { PricingOption, FormData } from "./types";
import { useEditGearFormValidation } from "./useEditGearFormValidation";
import { useEditGearImageHandling } from "./useEditGearImageHandling";
import { useEditGearLocationHandling } from "./useEditGearLocationHandling";
import { useEditGearDatabaseUpdate } from "./useEditGearDatabaseUpdate";

interface UseEditGearFormSubmissionProps {
  equipment: UserEquipment | null | undefined;
  gearName: string;
  gearType: string;
  description: string;
  zipCode: string;
  measurementUnit: string;
  dimensions: { length: string; width: string; thickness?: string };
  skillLevel: string;
  images: File[];
  pricingOptions: PricingOption[];
  damageDeposit: string;
  imageUrl: string;
  useImageUrl: boolean;
}

export const useEditGearFormSubmission = ({
  equipment,
  gearName,
  gearType,
  description,
  zipCode,
  measurementUnit,
  dimensions,
  skillLevel,
  images,
  pricingOptions,
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

    // Initial validation
    if (!validateSubmission({ user, equipment, pricingOptions, damageDeposit })) {
      return;
    }

    // Use the validation hook to validate the form
    const formData: FormData = {
      gearName,
      gearType,
      description,
      zipCode,
      measurementUnit,
      dimensions: {
        length: dimensions.length,
        width: dimensions.width,
        thickness: dimensions.thickness || ""
      },
      skillLevel,
      pricingOptions,
      damageDeposit,
      imageUrl,
      useImageUrl,
      role: user!.role || "private-party",
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
      const currentZip = equipment!.location?.zip || '';
      const coordinates = await handleLocationUpdate({ zipCode, currentZip });

      // Update database
      await updateGearInDatabase({
        equipment: equipment!,
        userId: user!.id,
        gearName,
        gearType,
        description,
        zipCode,
        coordinates,
        dimensions,
        measurementUnit,
        skillLevel,
        pricingOptions,
        damageDeposit,
        finalImageUrl
      });

      console.log('=== FORM SUBMISSION SUCCESS ===');

      toast({
        title: "Equipment Updated",
        description: `${gearName} has been successfully updated.`,
      });

      navigate("/my-gear");

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
    navigate("/my-gear");
  };

  return {
    handleSubmit,
    handleCancel,
    isSubmitting,
  };
};
