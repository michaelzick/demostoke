
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

    if (!user || !equipment) {
      toast({
        title: "Error",
        description: "Authentication error or equipment not found.",
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

      // Prepare equipment data for update
      const equipmentData = prepareEquipmentData(
        gearName,
        gearType,
        description,
        zipCode,
        measurementUnit,
        dimensions,
        skillLevel,
        parseFloat(pricingOptions[0].price),
        finalImageUrl,
        coordinates
      );

      // Update equipment in database
      await updateEquipmentInDatabase(equipment, equipmentData, user.id);

      // Update pricing options
      await updatePricingOptions(equipment.id, pricingOptions);

      toast({
        title: "Equipment Updated",
        description: `${gearName} has been successfully updated.`,
      });

      navigate("/my-gear");

    } catch (error) {
      console.error('Error updating equipment:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update equipment. Please try again.",
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
