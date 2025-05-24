
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/helpers";
import { supabase } from "@/integrations/supabase/client";
import { uploadGearImage } from "@/utils/imageUpload";

// Import form section components
import FormHeader from "@/components/gear-form/FormHeader";
import GearBasicInfo from "@/components/gear-form/GearBasicInfo";
import GearSpecifications from "@/components/gear-form/GearSpecifications";
import GearMedia from "@/components/gear-form/GearMedia";
import GearPricing from "@/components/gear-form/GearPricing";
import FormActions from "@/components/gear-form/FormActions";

interface PricingOption {
  id: string;
  price: string;
  duration: string;
}

interface DuplicatedGear {
  gearName: string;
  gearType: string;
  description: string;
  zipCode: string;
  measurementUnit: string;
  dimensions: {
    length: string;
    width: string;
  };
  skillLevel: string;
  price: string;
  damageDeposit: string;
}

const AddGearForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  // State for form fields
  const [gearName, setGearName] = useState("");
  const [gearType, setGearType] = useState("");
  const [description, setDescription] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [measurementUnit, setMeasurementUnit] = useState("");
  const [dimensions, setDimensions] = useState({ length: "", width: "" });
  const [skillLevel, setSkillLevel] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [pricingOptions, setPricingOptions] = useState<PricingOption[]>([
    { id: "1", price: "", duration: "day" }
  ]);
  const [damageDeposit, setDamageDeposit] = useState("");
  const [role, setRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to list your gear.",
        variant: "destructive",
      });
      navigate("/auth/signin");
    }
  }, [isAuthenticated, navigate, toast]);

  // Check for duplicated gear data on component mount
  useEffect(() => {
    const duplicatedGearJSON = sessionStorage.getItem('duplicatedGear');
    if (duplicatedGearJSON) {
      try {
        const duplicatedGear: DuplicatedGear = JSON.parse(duplicatedGearJSON);

        // Pre-populate form fields with duplicated gear data
        setGearName(duplicatedGear.gearName);
        setGearType(duplicatedGear.gearType);
        setDescription(duplicatedGear.description);
        setZipCode(duplicatedGear.zipCode);
        setMeasurementUnit(duplicatedGear.measurementUnit);
        setDimensions(duplicatedGear.dimensions);

        // Important: Set the gear type first, then set the skill level in a separate effect
        // This ensures the skill level options are available when the skill level is set
        setTimeout(() => {
          setSkillLevel(duplicatedGear.skillLevel);
        }, 100);

        // Set pricing options from duplicated data
        setPricingOptions([
          { id: "1", price: duplicatedGear.price, duration: "day" }
        ]);
        setDamageDeposit(duplicatedGear.damageDeposit);

        // Clear the sessionStorage after using it
        sessionStorage.removeItem('duplicatedGear');

        toast({
          title: "Duplicated Gear Data Loaded",
          description: "The form has been pre-filled with the duplicated gear's information. You can now edit and submit it as a new listing.",
        });
      } catch (error) {
        console.error("Error parsing duplicated gear data:", error);
      }
    }
  }, [toast]);

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

    if (!user) {
      toast({
        title: "Authentication Error",
        description: "Please sign in to list your gear.",
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
      let imageUrl = 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop'; // Default placeholder

      // Upload image if one was selected
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
            description: uploadError.message || "Failed to upload image. Using placeholder instead.",
            variant: "destructive",
          });
          // Continue with placeholder image if upload fails
        }
      }

      // Prepare the data for database insertion
      const equipmentData = {
        user_id: user.id,
        name: gearName,
        category: mapGearTypeToCategory(gearType),
        description: description,
        location_name: zipCode,
        size: `${dimensions.length} x ${dimensions.width} ${measurementUnit}`,
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
      const { data, error } = await supabase
        .from('equipment')
        .insert([equipmentData])
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Equipment created successfully:', data);

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

  const handleCancel = () => {
    navigate("/my-gear");
  };

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <FormHeader title="List Your Gear" />

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
        <GearBasicInfo
          gearName={gearName}
          setGearName={setGearName}
          gearType={gearType}
          setGearType={setGearType}
          description={description}
          setDescription={setDescription}
          role={role}
          setRole={setRole}
          zipCode={zipCode}
          setZipCode={setZipCode}
        />

        <GearSpecifications
          measurementUnit={measurementUnit}
          setMeasurementUnit={setMeasurementUnit}
          dimensions={dimensions}
          setDimensions={setDimensions}
          skillLevel={skillLevel}
          setSkillLevel={setSkillLevel}
          gearType={gearType}
        />

        <GearMedia
          handleImageUpload={handleImageUpload}
        />

        <GearPricing
          pricingOptions={pricingOptions}
          setPricingOptions={setPricingOptions}
          damageDeposit={damageDeposit}
          setDamageDeposit={setDamageDeposit}
        />

        <FormActions
          handleSubmit={handleSubmit}
          handleCancel={handleCancel}
          isEditing={false}
          isSubmitting={isSubmitting}
        />
      </form>
    </div>
  );
};

export default AddGearForm;
