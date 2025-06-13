
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/helpers";
import { uploadGearImage } from "@/utils/imageUpload";
import { useGearFormValidation } from "@/hooks/useGearFormValidation";
import { geocodeZipCode } from "@/utils/geocoding";
import { prepareEquipmentData } from "@/utils/equipmentDataPreparation";
import { updateEquipmentInDatabase } from "@/services/equipmentUpdateService";
import { updatePricingOptions } from "@/services/pricingOptionsService";
import { UserEquipment } from "@/types/equipment";
import { PricingOption, FormData } from "./types";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('=== FORM SUBMISSION START ===');
    console.log('Form data at submission:', {
      pricingOptions,
      damageDeposit,
      equipment: equipment?.id,
      user: user?.id
    });

    if (!user || !equipment) {
      console.error('Missing user or equipment:', { user: !!user, equipment: !!equipment });
      toast({
        title: "Error",
        description: "Authentication error or equipment not found.",
        variant: "destructive",
      });
      return;
    }

    // Validate pricing options before proceeding
    if (!pricingOptions || pricingOptions.length === 0) {
      console.error('No pricing options provided');
      toast({
        title: "Error",
        description: "At least one pricing option is required.",
        variant: "destructive",
      });
      return;
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
        return;
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
      role: user.role || "private-party",
    };

    if (!validateForm(formData)) {
      console.error('Form validation failed');
      return;
    }

    setIsSubmitting(true);

    try {
      let finalImageUrl = equipment.image_url; // Keep existing image by default

      // Handle image upload or URL
      if (useImageUrl && imageUrl) {
        finalImageUrl = imageUrl;
        console.log('Using provided image URL:', finalImageUrl);
      } else if (images.length > 0) {
        console.log('Uploading new image:', images[0].name);
        toast({
          title: "Uploading Image",
          description: "Please wait while we upload your gear image...",
        });

        try {
          finalImageUrl = await uploadGearImage(images[0], user.id);
          console.log('Image uploaded successfully:', finalImageUrl);
        } catch (error: unknown) {
          console.error('Image upload failed:', error);
          toast({
            title: "Image Upload Failed",
            description: error instanceof Error ? error.message : "Failed to upload image. Keeping existing image.",
            variant: "destructive",
          });
        }
      }

      // Get coordinates from zip code (only if zip code changed)
      let coordinates = null;
      const currentZip = equipment.location?.zip || '';
      if (zipCode !== currentZip) {
        try {
          coordinates = await geocodeZipCode(zipCode);
          console.log('Updated coordinates for zip code', zipCode, ':', coordinates);
        } catch (error) {
          console.error('Geocoding failed:', error);
        }
      }

      // Prepare equipment data for update - using the first pricing option for the main price
      const firstPricingPrice = pricingOptions.length > 0 ? pricingOptions[0].price : equipment.price_per_day.toString();
      
      console.log('Preparing equipment data with:', {
        firstPricingPrice,
        damageDeposit,
        finalImageUrl
      });

      const equipmentData = prepareEquipmentData({
        gearName,
        gearType,
        description,
        zipCode,
        coordinates,
        dimensions,
        measurementUnit,
        skillLevel,
        firstPricingOptionPrice: firstPricingPrice,
        finalImageUrl,
        damageDeposit,
      });

      console.log('Final equipment data to save:', equipmentData);

      // Update equipment in database
      console.log('=== UPDATING EQUIPMENT ===');
      const updatedEquipment = await updateEquipmentInDatabase(equipment, equipmentData, user.id);
      console.log('Equipment update completed:', updatedEquipment);

      // Update pricing options - ensure we have valid pricing options
      console.log('=== UPDATING PRICING OPTIONS ===');
      console.log('Pricing options to save:', pricingOptions);
      
      if (pricingOptions.length > 0) {
        const pricingResult = await updatePricingOptions(equipment.id, pricingOptions);
        console.log('Pricing options update completed:', pricingResult);
      } else {
        console.warn('No pricing options to update');
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
