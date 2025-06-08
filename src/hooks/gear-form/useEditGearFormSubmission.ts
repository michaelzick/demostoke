import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/helpers";
import { supabase } from "@/integrations/supabase/client";
import { uploadGearImage } from "@/utils/imageUpload";
import { useGearFormValidation } from "@/hooks/useGearFormValidation";
import { geocodeZipCode } from "@/utils/geocoding";
import { UserEquipment } from "@/types/equipment";
import { PricingOption } from "./types";

interface FormData {
  gearName: string;
  gearType: string;
  description: string;
  zipCode: string;
  measurementUnit: string;
  dimensions: { length: string; width: string; thickness?: string };
  skillLevel: string;
  pricingOptions: PricingOption[];
  damageDeposit: string;
  imageUrl: string;
  useImageUrl: boolean;
}

interface UseEditGearFormSubmissionProps extends FormData {
  equipment: UserEquipment | null | undefined;
  images: File[];
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

  const mapGearTypeToCategory = (gearType: string): string => {
    const typeMap: { [key: string]: string } = {
      "snowboard": "snowboards",
      "skis": "skis",
      "surfboard": "surfboards",
      "sup": "sups",
      "skateboard": "skateboards"
    };
    return typeMap[gearType] || gearType;
  };

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
    const formData = {
      gearName,
      gearType,
      description,
      zipCode,
      measurementUnit,
      dimensions,
      skillLevel,
      pricingOptions,
      damageDeposit,
      imageUrl,
      useImageUrl,
      role: user.role || "private-party", // Get role from user profile
    };

    if (!validateForm(formData)) {
      return;
    }

    setIsSubmitting(true);

    try {
      let finalImageUrl = equipment.image_url; // Keep existing image by default

      // If using image URL, use that instead of uploading
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
          // Keep existing image if upload fails
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
          // Continue without updating coordinates if geocoding fails
        }
      }

      // Prepare the data for database update
      const isMountainBike = gearType === "mountain-bike";
      const sizeString = isMountainBike
        ? dimensions.length // For mountain bikes, just use the size (S/M/L/XL/XXL)
        : dimensions.thickness
          ? `${dimensions.length} x ${dimensions.width} x ${dimensions.thickness} ${measurementUnit}`
          : `${dimensions.length} x ${dimensions.width} ${measurementUnit}`;

      const equipmentData = {
        name: gearName,
        category: mapGearTypeToCategory(gearType),
        description: description,
        location_zip: zipCode,
        ...(coordinates && {
          location_lat: coordinates.lat,
          location_lng: coordinates.lng,
        }),
        size: sizeString,
        suitable_skill_level: skillLevel,
        price_per_day: parseFloat(pricingOptions[0].price),
        image_url: finalImageUrl,
      };

      console.log('Updating equipment data:', equipmentData);

      // Update the equipment in the database
      const { data, error } = await supabase
        .from('equipment')
        .update(equipmentData)
        .eq('id', equipment.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Equipment updated successfully:', data);

      // Delete existing pricing options and insert new ones
      const { error: deleteError } = await supabase
        .from('pricing_options')
        .delete()
        .eq('equipment_id', equipment.id);

      if (deleteError) {
        console.error('Error deleting old pricing options:', deleteError);
        throw deleteError;
      }

      // Insert new pricing options
      const pricingData = pricingOptions.map(option => ({
        equipment_id: equipment.id,
        price: parseFloat(option.price),
        duration: option.duration
      }));

      const { error: pricingError } = await supabase
        .from('pricing_options')
        .insert(pricingData);

      if (pricingError) {
        console.error('Pricing options error:', pricingError);
        throw pricingError;
      }

      console.log('Pricing options updated successfully');

      toast({
        title: "Equipment Updated",
        description: `${gearName} has been successfully updated.`,
      });

      // Navigate back to My Gear page
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
