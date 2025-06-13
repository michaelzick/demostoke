
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/helpers";
import { useGearFormValidation } from "@/hooks/useGearFormValidation";
import { geocodeZipCode } from "@/utils/geocoding";
import { uploadMultipleGearImages, saveEquipmentImages } from "@/utils/multipleImageHandling";
import { prepareEquipmentData } from "@/utils/equipmentDataPreparation";
import { createEquipmentInDatabase, createPricingOptionsInDatabase } from "@/utils/gearDatabaseOperations";
import { PricingOption, FormData } from "./types";

interface UseMultipleGearFormSubmissionProps {
  gearName: string;
  gearType: string;
  description: string;
  zipCode: string;
  measurementUnit: string;
  dimensions: { length: string; width: string; thickness?: string };
  skillLevel: string;
  role: string;
  damageDeposit: string;
  pricingOptions: PricingOption[];
  imageUrls: string[];
  useImageUrls: boolean;
  images: File[];
  duplicatedImageUrls?: string[];
}

export const useMultipleGearFormSubmission = ({
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
  duplicatedImageUrls,
  imageUrls,
  useImageUrls,
}: UseMultipleGearFormSubmissionProps) => {
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
      imageUrl: useImageUrls ? imageUrls[0] : "",
      useImageUrl: useImageUrls,
      role,
    };

    if (!validateForm(formData)) {
      return;
    }

    setIsSubmitting(true);

    try {
      let finalImageUrls: string[] = [];

      // Handle multiple images
      if (useImageUrls && imageUrls.some(url => url.trim())) {
        finalImageUrls = imageUrls.filter(url => url.trim());
        console.log('Using provided image URLs:', finalImageUrls);
      } else if (images.length > 0) {
        console.log('Uploading multiple images:', images.map(f => f.name));
        
        try {
          finalImageUrls = await uploadMultipleGearImages(images, user.id, (message) => {
            toast({
              title: "Uploading Images",
              description: message,
            });
          });
          console.log('Images uploaded successfully:', finalImageUrls);
        } catch (error: unknown) {
          console.error('Image upload failed:', error);
          toast({
            title: "Image Upload Failed",
            description: error instanceof Error ? error.message : "Failed to upload images. Using default image.",
            variant: "destructive",
          });
          finalImageUrls = ['/img/demostoke-logo-ds-transparent-cropped.webp'];
        }
      } else if (duplicatedImageUrls?.length) {
        finalImageUrls = duplicatedImageUrls;
      } else {
        finalImageUrls = ['/img/demostoke-logo-ds-transparent-cropped.webp'];
      }

      // Get coordinates from zip code
      let coordinates = null;
      try {
        coordinates = await geocodeZipCode(zipCode);
        console.log('Coordinates for zip code', zipCode, ':', coordinates);
      } catch (error) {
        console.error('Geocoding failed:', error);
      }

      // Prepare equipment data with primary image
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
        finalImageUrl: finalImageUrls[0], // Primary image
      });

      // Create equipment in database
      const equipmentResult = await createEquipmentInDatabase(equipmentData);

      // Save all images to equipment_images table
      await saveEquipmentImages(equipmentResult.id, finalImageUrls);

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
