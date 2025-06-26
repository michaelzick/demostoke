
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

interface UseMultipleEditGearFormSubmissionProps {
  equipment: UserEquipment | null | undefined;
  gearName: string;
  gearType: string;
  description: string;
  zipCode: string;
  measurementUnit: string;
  dimensions: { length: string; width: string; thickness?: string };
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
  zipCode,
  measurementUnit,
  dimensions,
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
    console.log('Dimensions at submission:', dimensions);

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

    // Initial validation
    if (!validateSubmission({ user, equipment, pricingOptions, damageDeposit })) {
      return;
    }

    // For bike types, use selectedSizes directly from form state for validation
    const isBikeType = gearType === "mountain-bike" || gearType === "e-bike";

    // Use the validation hook to validate the form
    const formData: any = {
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
      imageUrl: useImageUrls ? imageUrls[0] : "",
      useImageUrl: useImageUrls,
      role: user!.role || "private-party",
      selectedSizes: isBikeType ? selectedSizes : [], // Use the actual selectedSizes state
    };

    if (!validateForm(formData)) {
      console.error('Form validation failed');
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
          finalImageUrls = equipment?.images || (equipment?.image_url ? [equipment.image_url] : []);
        }
      } else {
        // Keep existing images
        finalImageUrls = equipment?.images || (equipment?.image_url ? [equipment.image_url] : []);
      }

      // Handle location updates
      const currentZip = equipment!.location?.zip || '';
      const coordinates = await handleLocationUpdate({ zipCode, currentZip });

      // Update database with individual price fields
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
        pricePerDay,
        pricePerHour: pricePerHour.trim() || undefined,
        pricePerWeek: pricePerWeek.trim() || undefined,
        damageDeposit,
        finalImageUrl: finalImageUrls[0] || equipment!.image_url
      });

      // Update images in the database
      if (finalImageUrls.length > 0) {
        await updateEquipmentImages(equipment!.id, finalImageUrls);
      }

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
