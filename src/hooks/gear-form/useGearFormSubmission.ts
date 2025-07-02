
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/helpers";
import { useGearFormValidation } from "@/hooks/useGearFormValidation";
import { geocodeAddress } from "@/utils/geocoding";
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
  size: string;
  skillLevel: string;
  images: File[];
  pricePerDay: string;
  pricePerHour: string;
  pricePerWeek: string;
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
  size,
  skillLevel,
  images,
  pricePerDay,
  pricePerHour,
  pricePerWeek,
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

    // Create pricingOptions array for validation
    const pricingOptions: PricingOption[] = [
      { price: pricePerDay, duration: "day" }
    ];
    if (pricePerHour.trim()) {
      pricingOptions.push({ price: pricePerHour, duration: "hour" });
    }
    if (pricePerWeek.trim()) {
      pricingOptions.push({ price: pricePerWeek, duration: "week" });
    }

    // Use the validation hook to validate the form
    const formData: FormData = {
      gearName,
      gearType,
      description,
      zipCode,
      measurementUnit,
      size,
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

      // Get coordinates from address
      let coordinates = null;
      try {
        coordinates = await geocodeAddress(zipCode);
        console.log('Coordinates for address', zipCode, ':', coordinates);
      } catch (error) {
        console.error('Geocoding failed:', error);
        // Continue without coordinates if geocoding fails
      }

      // Prepare equipment data with individual price fields
      const equipmentData = prepareEquipmentData({
        userId: user.id,
        gearName,
        gearType,
        description,
        zipCode,
        coordinates,
        size,
        skillLevel,
        pricePerDay: pricePerDay,
        pricePerHour: pricePerHour.trim() || undefined,
        pricePerWeek: pricePerWeek.trim() || undefined,
        finalImageUrl,
        damageDeposit,
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
