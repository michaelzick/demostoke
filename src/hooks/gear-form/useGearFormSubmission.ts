
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/helpers";
import { useGearFormValidation } from "@/hooks/useGearFormValidation";
import { geocodeZipCode } from "@/utils/geocoding";
import { handleGearImageUpload } from "@/utils/gearImageHandling";
import { prepareEquipmentData } from "@/utils/equipmentDataPreparation";
import { createEquipmentInDatabase, createPricingOptionsInDatabase } from "@/utils/gearDatabaseOperations";
import { PricingOption, FormData } from "./types";

interface UseGearFormSubmissionProps {
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
  role: string;
  duplicatedImageUrl?: string;
  imageUrl: string;
  useImageUrl: boolean;
}

export const useGearFormSubmission = ({
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
  role,
  duplicatedImageUrl,
  imageUrl,
  useImageUrl,
}: UseGearFormSubmissionProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { validateForm } = useGearFormValidation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Authentication Error",
        description: "Please sign in to list your gear.",
        variant: "destructive",
      });
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
      damageDeposit,
      pricingOptions,
      imageUrl,
      useImageUrl,
      role,
    };

    if (!validateForm(formData)) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Handle image upload
      const finalImageUrl = await handleGearImageUpload({
        useImageUrl,
        imageUrl,
        images,
        userId: user.id,
        duplicatedImageUrl,
        onProgress: (message) => {
          toast({
            title: "Uploading Image",
            description: message,
          });
        },
      });

      // Get coordinates from zip code
      let coordinates = null;
      try {
        coordinates = await geocodeZipCode(zipCode);
        console.log('Coordinates for zip code', zipCode, ':', coordinates);
      } catch (error) {
        console.error('Geocoding failed:', error);
        // Continue without coordinates if geocoding fails
      }

      // Prepare equipment data
      const equipmentData = prepareEquipmentData({
        userId: user.id,
        gearName,
        gearType,
        description,
        zipCode,
        coordinates,
        dimensions,
        measurementUnit,
        skillLevel,
        firstPricingOptionPrice: pricingOptions[0].price,
        finalImageUrl,
      });

      // Create equipment in database
      const equipmentResult = await createEquipmentInDatabase(equipmentData);

      // Create pricing options in database
      await createPricingOptionsInDatabase(equipmentResult.id, pricingOptions);

      toast({
        title: "Equipment Added",
        description: `${gearName} has been successfully added to your inventory.`,
      });

      // Navigate back to My Gear page
      navigate("/my-gear");

    } catch (error) {
      console.error('Error creating equipment:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add equipment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleSubmit,
    isSubmitting,
  };
};
