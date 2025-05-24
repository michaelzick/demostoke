import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useEquipmentById } from "@/hooks/useEquipmentById";
import { supabase } from "@/integrations/supabase/client";
import { uploadGearImage } from "@/utils/imageUpload";
import { useAuth } from "@/helpers";
import { mapCategoryToGearType, mapSkillLevel, parseSize } from "@/utils/gearDataMapping";

interface PricingOption {
  id: string;
  price: string;
  duration: string;
}

export const useEditGearForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: equipment, isLoading, error } = useEquipmentById(id || "");

  // Form state
  const [gearName, setGearName] = useState("");
  const [gearType, setGearType] = useState("");
  const [description, setDescription] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [measurementUnit, setMeasurementUnit] = useState("inches");
  const [dimensions, setDimensions] = useState({ length: "", width: "" });
  const [skillLevel, setSkillLevel] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [pricingOptions, setPricingOptions] = useState<PricingOption[]>([
    { id: "1", price: "", duration: "day" }
  ]);
  const [damageDeposit, setDamageDeposit] = useState("100");
  const [role, setRole] = useState("private-party");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update state when equipment data is loaded
  useEffect(() => {
    if (equipment) {
      console.log('Equipment loaded:', equipment);
      const mappedGearType = mapCategoryToGearType(equipment.category);
      console.log('Mapped gear type:', mappedGearType);
      console.log('Original skill level:', equipment.suitable_skill_level);
      
      setGearName(equipment.name);
      setGearType(mappedGearType);
      setDescription(equipment.description || "");
      setZipCode(equipment.location_name || "");
      setDimensions(parseSize(equipment.size || ""));
      
      // Map skill level after setting gear type
      const mappedSkillLevel = mapSkillLevel(equipment.suitable_skill_level || "", mappedGearType);
      console.log('Mapped skill level:', mappedSkillLevel);
      setSkillLevel(mappedSkillLevel);
      
      setPricingOptions([
        { id: "1", price: equipment.price_per_day.toString(), duration: "day" }
      ]);
    }
  }, [equipment]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

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

    // Validate required fields
    if (!gearName || !gearType || !description || !zipCode || !measurementUnit || 
        !dimensions.length || !dimensions.width || !skillLevel || !role || !damageDeposit) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields before submitting.",
        variant: "destructive",
      });
      return;
    }

    // Validate that at least one pricing option exists and is filled
    if (pricingOptions.length === 0 || pricingOptions.every(option => !option.price)) {
      toast({
        title: "Missing Pricing",
        description: "Please add at least one pricing option.",
        variant: "destructive",
      });
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
        } catch (uploadError: any) {
          console.error('Image upload failed:', uploadError);
          toast({
            title: "Image Upload Failed",
            description: uploadError.message || "Failed to upload image. Keeping existing image.",
            variant: "destructive",
          });
          // Keep existing image if upload fails
        }
      }

      // Prepare the data for database update
      const equipmentData = {
        name: gearName,
        category: mapGearTypeToCategory(gearType),
        description: description,
        location_name: zipCode,
        size: `${dimensions.length} x ${dimensions.width} ${measurementUnit}`,
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

      toast({
        title: "Equipment Updated",
        description: `${gearName} has been successfully updated.`,
      });

      // Navigate back to My Gear page
      navigate("/my-gear");

    } catch (error: any) {
      console.error('Error updating equipment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update equipment. Please try again.",
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
    equipment,
    isLoading,
    error,
    formState: {
      gearName,
      setGearName,
      gearType,
      setGearType,
      description,
      setDescription,
      zipCode,
      setZipCode,
      measurementUnit,
      setMeasurementUnit,
      dimensions,
      setDimensions,
      skillLevel,
      setSkillLevel,
      images,
      setImages,
      pricingOptions,
      setPricingOptions,
      damageDeposit,
      setDamageDeposit,
      role,
      setRole,
    },
    handlers: {
      handleImageUpload,
      handleCancel,
      handleSubmit,
    },
    isSubmitting,
    navigate,
    toast,
  };
};
