
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/helpers";
import { supabase } from "@/integrations/supabase/client";
import { uploadGearImage } from "@/utils/imageUpload";
import { useGearFormValidation } from "@/hooks/useGearFormValidation";
import { PricingOption } from "./types";

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
}: UseGearFormSubmissionProps) => {
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

    if (!user) {
      toast({
        title: "Authentication Error",
        description: "Please sign in to list your gear.",
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
      role,
      damageDeposit,
      pricingOptions,
    };

    if (!validateForm(formData)) {
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = duplicatedImageUrl || '/img/demostoke-logo-ds-transparent-cropped.webp'; // Use DS logo as default placeholder

      // Upload new image if one was selected
      if (images.length > 0) {
        console.log('Uploading image:', images[0].name);
        toast({
          title: "Uploading Image",
          description: "Please wait while we upload your gear image...",
        });

        try {
          imageUrl = await uploadGearImage(images[0], user.id);
          console.log('Image uploaded successfully:', imageUrl);
        } catch (uploadError: any) {
          console.error('Image upload failed:', uploadError);
          toast({
            title: "Image Upload Failed",
            description: uploadError.message || "Failed to upload image. Using DS logo instead.",
            variant: "destructive",
          });
          // Continue with DS logo if upload fails
        }
      }

      // Prepare the data for database insertion
      const sizeString = dimensions.thickness
        ? `${dimensions.length} x ${dimensions.width} x ${dimensions.thickness} ${measurementUnit}`
        : `${dimensions.length} x ${dimensions.width} ${measurementUnit}`;

      const equipmentData = {
        user_id: user.id,
        name: gearName,
        category: mapGearTypeToCategory(gearType),
        description: description,
        location_zip: zipCode,
        size: sizeString,
        suitable_skill_level: skillLevel,
        price_per_day: parseFloat(pricingOptions[0].price),
        status: 'available' as const,
        image_url: imageUrl,
        rating: 0,
        review_count: 0,
        location_lat: null,
        location_lng: null,
        weight: null,
        material: null
      };

      console.log('Submitting equipment data:', equipmentData);

      // Insert the equipment into the database
      const { data: equipmentResult, error: equipmentError } = await supabase
        .from('equipment')
        .insert([equipmentData])
        .select()
        .single();

      if (equipmentError) {
        console.error('Database error:', equipmentError);
        throw equipmentError;
      }

      console.log('Equipment created successfully:', equipmentResult);

      // Now insert all pricing options
      const pricingData = pricingOptions.map(option => ({
        equipment_id: equipmentResult.id,
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

      console.log('Pricing options created successfully');

      toast({
        title: "Equipment Added",
        description: `${gearName} has been successfully added to your inventory.`,
      });

      // Navigate back to My Gear page
      navigate("/my-gear");

    } catch (error: any) {
      console.error('Error creating equipment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add equipment. Please try again.",
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
