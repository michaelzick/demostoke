
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/helpers";
import { supabase } from "@/integrations/supabase/client";
import { uploadGearImage } from "@/utils/imageUpload";
import { useGearFormValidation } from "@/hooks/useGearFormValidation";
import { UserEquipment } from "@/types/equipment";
import { PricingOption } from "./types";

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

    // Use the validation hook to validate the form (role is now stored in user profile)
    const formData = {
      gearName,
      gearType,
      description,
      zipCode,
      measurementUnit,
      dimensions,
      skillLevel,
      role: user.role || "private-party", // Get role from user profile
      damageDeposit,
      pricingOptions,
    };

    if (!validateForm(formData)) {
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = equipment.image_url; // Keep existing image by default

      // Upload new image if one was selected
      if (images.length > 0) {
        console.log('Uploading new image:', images[0].name);
        toast({
          title: "Uploading Image",
          description: "Please wait while we upload your gear image...",
        });

        try {
          imageUrl = await uploadGearImage(images[0], user.id);
          console.log('Image uploaded successfully:', imageUrl);
        } catch (uploadError: unknown) {
          console.error('Image upload failed:', uploadError);
          toast({
            title: "Image Upload Failed",
            description: uploadError instanceof Error ? uploadError.message : "Failed to upload image. Keeping existing image.",
            variant: "destructive",
          });
          // Keep existing image if upload fails
        }
      }

      // Prepare the data for database update
      const sizeString = dimensions.thickness
        ? `${dimensions.length} x ${dimensions.width} x ${dimensions.thickness} ${measurementUnit}`
        : `${dimensions.length} x ${dimensions.width} ${measurementUnit}`;

      const equipmentData = {
        name: gearName,
        category: mapGearTypeToCategory(gearType),
        description: description,
        location_zip: zipCode,
        size: sizeString,
        suitable_skill_level: skillLevel,
        price_per_day: parseFloat(pricingOptions[0].price),
        image_url: imageUrl,
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

    } catch (error: unknown) {
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
