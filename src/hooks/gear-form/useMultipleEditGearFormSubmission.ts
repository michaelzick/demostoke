import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/helpers";
import { useGearFormValidation } from "@/hooks/useGearFormValidation";
import { UserEquipment } from "@/types/equipment";
import { useEditGearFormValidation } from "./useEditGearFormValidation";
import { useEditGearLocationHandling } from "./useEditGearLocationHandling";
import { useEditGearDatabaseUpdate } from "./useEditGearDatabaseUpdate";
import { uploadMultipleGearImages, updateEquipmentImages } from "@/utils/multipleImageHandling";
import { slugify } from "@/utils/slugify";
import type { FormData } from "./types";

interface UseMultipleEditGearFormSubmissionProps {
  equipment: UserEquipment | null | undefined;
  gearName: string;
  gearType: string;
  description: string;
  address: string; // Changed from zipCode
  measurementUnit: string;
  size: string;
  skillLevel: string;
  images: File[];
  pricePerDay: string;
  pricePerHour: string;
  pricePerWeek: string;
  damageDeposit: string;
  imageUrls: string[];
  useImageUrls: boolean;
  selectedSizes?: string[];
}

export const useMultipleEditGearFormSubmission = ({
  equipment,
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
  imageUrls,
  useImageUrls,
  selectedSizes = [],
}: UseMultipleEditGearFormSubmissionProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { validateForm } = useGearFormValidation();
  const { validateSubmission } = useEditGearFormValidation();
  const { handleLocationUpdate } = useEditGearLocationHandling();
  const { updateGearInDatabase } = useEditGearDatabaseUpdate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('=== FORM SUBMISSION START ===');
    console.log('Damage deposit value at submission start:', damageDeposit);
    console.log('Selected sizes at submission:', selectedSizes);
    console.log('Size at submission:', size);

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

    // For bike types, use selectedSizes directly from form state for validation
    const isBikeType = gearType === "mountain-bike" || gearType === "e-bike";

    // Use the validation hook to validate the form
    const formData: FormData & { selectedSizes: string[] } = {
      gearName,
      gearType,
      description,
      address, // Changed from zipCode
      measurementUnit,
      size: isBikeType ? selectedSizes.join(", ") : size,
      skillLevel,
      pricingOptions,
      damageDeposit,
      imageUrl: useImageUrls ? imageUrls[0] : "",
      useImageUrl: useImageUrls,
      role: "private-party", // Default role for gear listing
      selectedSizes: isBikeType ? selectedSizes : [], // Use the actual selectedSizes state
    };

    if (!validateForm(formData)) {
      console.error('Form validation failed');
      return;
    }

    setIsSubmitting(true);

    try {
      let finalImageUrls: string[] = [];

      // Handle multiple images - merge existing with new instead of overwriting
      if (useImageUrls && imageUrls.some(url => url.trim())) {
        // When using image URLs, merge with existing images instead of replacing
        const existingImages = equipment?.images || [];
        const newImageUrls = imageUrls.filter(url => url.trim());
        
        // Check if we're adding new URLs or if this includes existing ones
        const existingSet = new Set(existingImages);
        const newUrls = newImageUrls.filter(url => !existingSet.has(url));
        
        if (newUrls.length > 0) {
          // We have new URLs to add - merge them
          finalImageUrls = [...existingImages, ...newUrls];
          console.log('Merging existing images with new URLs:', { existing: existingImages, new: newUrls, final: finalImageUrls });
        } else {
          // All URLs are from existing images (user might have removed some)
          finalImageUrls = newImageUrls;
          console.log('Using filtered existing image URLs:', finalImageUrls);
        }
      } else if (images.length > 0) {
        console.log('Uploading multiple images:', images.map(f => f.name));
        
        try {
          finalImageUrls = await uploadMultipleGearImages(images, user!.id, (message) => {
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
            description: error instanceof Error ? error.message : "Failed to upload images. Keeping existing images.",
            variant: "destructive",
          });
          // Keep existing images if upload fails
          finalImageUrls = equipment?.images || [];
        }
      } else {
        // Keep existing images
        finalImageUrls = equipment?.images || [];
      }

      // Handle location updates
      const currentAddress = equipment!.location?.address || ''; // Changed from zip to address
      const coordinates = await handleLocationUpdate({ address, currentAddress }); // Changed parameters

      // Update database with individual price fields - pass empty strings to allow clearing
      await updateGearInDatabase({
        equipment: equipment!,
        userId: user!.id,
        gearName,
        gearType,
        description,
        address, // Changed from zipCode
        coordinates,
        size: isBikeType ? selectedSizes.join(", ") : size,
        skillLevel,
        pricePerDay,
        pricePerHour: pricePerHour, // Don't filter empty - let prepareEquipmentData handle it
        pricePerWeek: pricePerWeek, // Don't filter empty - let prepareEquipmentData handle it
        damageDeposit,
        finalImageUrl: finalImageUrls[0] || equipment!.image_url
      });

      // Update images in the database
      if (finalImageUrls.length > 0) {
        // Determine if we should merge or replace based on whether user added URLs to existing images
        const hasExistingImages = equipment?.images && equipment.images.length > 0;
        const shouldMerge = useImageUrls && hasExistingImages && 
                          imageUrls.some(url => url.trim() && !(equipment?.images || []).includes(url));
        
        console.log('Image update strategy:', { shouldMerge, hasExistingImages, useImageUrls });
        await updateEquipmentImages(equipment!.id, finalImageUrls, false); // Always replace for now, merging logic is handled above
      }

      console.log('=== FORM SUBMISSION SUCCESS ===');

      toast({
        title: "Equipment Updated",
        description: `${gearName} has been successfully updated.`,
      });

      navigate(
        `/${equipment!.category}/${slugify(equipment!.owner.name)}/${slugify(equipment!.name)}`,
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
      `/${equipment!.category}/${slugify(equipment!.owner.name)}/${slugify(equipment!.name)}`,
    );
  };

  return {
    handleSubmit,
    handleCancel,
    isSubmitting,
  };
};
