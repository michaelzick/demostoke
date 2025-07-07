
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/helpers";
import { useGearFormValidation } from "@/hooks/useGearFormValidation";
import { geocodeAddress } from "@/utils/geocoding";
import { uploadMultipleGearImages, saveEquipmentImages } from "@/utils/multipleImageHandling";
import { prepareEquipmentData } from "@/utils/equipmentDataPreparation";
import { createEquipmentInDatabase } from "@/utils/gearDatabaseOperations";
import type { FormData } from "./types";

interface UseMultipleGearFormSubmissionProps {
  gearName: string;
  gearType: string;
  description: string;
  address: string; // Changed from zipCode
  measurementUnit: string;
  size: string;
  skillLevel: string;
  role: string;
  damageDeposit: string;
  pricePerDay: string;
  pricePerHour: string;
  pricePerWeek: string;
  imageUrls: string[];
  useImageUrls: boolean;
  images: File[];
  duplicatedImageUrls?: string[];
}

export const useMultipleGearFormSubmission = ({
  gearName,
  gearType,
  description,
  address, // Changed from zipCode
  measurementUnit,
  size,
  skillLevel,
  images,
  pricePerDay,
  pricePerHour,
  pricePerWeek,
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

    // Create pricingOptions array for validation
    const pricingOptions = [
      { price: pricePerDay, duration: "day" }
    ];
    if (pricePerHour.trim()) {
      pricingOptions.push({ price: pricePerHour, duration: "hour" });
    }
    if (pricePerWeek.trim()) {
      pricingOptions.push({ price: pricePerWeek, duration: "week" });
    }

    // Check if this is a bike type and extract selected sizes from size field
    const isBikeType = gearType === "mountain-bike" || gearType === "e-bike";
    const selectedSizes = isBikeType ? size.split(", ").filter(s => s.trim()) : [];

    // Use the validation hook to validate the form
    const formData: FormData & { selectedSizes: string[] } = {
      gearName,
      gearType,
      description,
      address, // Changed from zipCode
      measurementUnit,
      size,
      skillLevel,
      damageDeposit,
      pricingOptions,
      imageUrl: useImageUrls ? imageUrls[0] : "",
      useImageUrl: useImageUrls,
      role,
      selectedSizes,
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

      // Get coordinates from address
      let coordinates = null;
      try {
        coordinates = await geocodeAddress(address); // Changed from zipCode
        console.log('Coordinates for address', address, ':', coordinates); // Changed log message
      } catch (error) {
        console.error('Geocoding failed:', error);
      }

      // Prepare equipment data with primary image and individual price fields
      const equipmentData = prepareEquipmentData({
        userId: user.id,
        gearName,
        gearType,
        description,
        address, // Changed from zipCode
        coordinates,
        size,
        skillLevel,
        pricePerDay,
        pricePerHour: pricePerHour.trim() || undefined,
        pricePerWeek: pricePerWeek.trim() || undefined,
        finalImageUrl: finalImageUrls[0], // Primary image
        damageDeposit,
      });

      // Create equipment in database
      const equipmentResult = await createEquipmentInDatabase(equipmentData);

      // Save all images to equipment_images table
      await saveEquipmentImages(equipmentResult.id, finalImageUrls);

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
