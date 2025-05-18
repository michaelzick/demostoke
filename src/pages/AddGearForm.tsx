
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

// Import form section components
import FormHeader from "@/components/gear-form/FormHeader";
import GearBasicInfo from "@/components/gear-form/GearBasicInfo";
import GearSpecifications from "@/components/gear-form/GearSpecifications";
import GearMedia from "@/components/gear-form/GearMedia";
import GearPricing from "@/components/gear-form/GearPricing";
import FormActions from "@/components/gear-form/FormActions";

const AddGearForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // State for form fields
  const [gearName, setGearName] = useState("");
  const [gearType, setGearType] = useState("");
  const [description, setDescription] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [measurementUnit, setMeasurementUnit] = useState("");
  const [dimensions, setDimensions] = useState({ length: "", width: "" });
  const [skillLevel, setSkillLevel] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("day");
  const [damageDeposit, setDamageDeposit] = useState("");
  const [role, setRole] = useState("");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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
      price,
      duration,
      damageDeposit,
      role,
    });
    
    toast({
      title: "Equipment Added",
      description: `${gearName} has been successfully added to your inventory.`,
    });
    
    // Navigate back to My Equipment page
    navigate("/my-equipment");
  };

  const handleCancel = () => {
    navigate("/my-equipment");
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
          price={price}
          setPrice={setPrice}
          duration={duration}
          setDuration={setDuration}
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
