
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

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

  // State for form fields
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
  const [damageDeposit, setDamageDeposit] = useState("");
  const [role, setRole] = useState("");

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that at least one pricing option exists and is filled
    if (pricingOptions.length === 0 || pricingOptions.every(option => !option.price)) {
      toast({
        title: "Missing Pricing",
        description: "Please add at least one pricing option.",
        variant: "destructive",
      });
      return;
    }

    // Log form data for debugging
    console.log({
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
    });

    toast({
      title: "Equipment Added",
      description: `${gearName} has been successfully added to your inventory.`,
    });

    // Navigate back to My Gear page
    navigate("/my-gear");
  };

  const handleCancel = () => {
    navigate("/my-gear");
  };

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
        />
      </form>
    </div>
  );
};

export default AddGearForm;
