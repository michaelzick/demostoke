
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { mockUserEquipment } from "@/lib/userEquipment";
import { useToast } from "@/hooks/use-toast";

// Import form section components
import FormHeader from "@/components/gear-form/FormHeader";
import GearBasicInfo from "@/components/gear-form/GearBasicInfo";
import GearSpecifications from "@/components/gear-form/GearSpecifications";
import GearMedia from "@/components/gear-form/GearMedia";
import GearPricing from "@/components/gear-form/GearPricing";
import FormActions from "@/components/gear-form/FormActions";

const EditGearForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();

  // Find the equipment by ID
  const equipment = mockUserEquipment.find(item => item.id === id);

  // Initialize state with equipment data or defaults
  const [gearName, setGearName] = useState(equipment?.name || "");
  const [gearType, setGearType] = useState(equipment?.category.slice(0, -1) || "");
  const [description, setDescription] = useState(equipment?.description || "");
  const [zipCode, setZipCode] = useState(equipment?.location?.name || "");
  const [measurementUnit, setMeasurementUnit] = useState("inches");

  // Parse size from specifications
  const parseSize = () => {
    const sizeStr = equipment?.specifications?.size || "";
    if (sizeStr.includes("x")) {
      const [length, width] = sizeStr.split("x").map(s => s.trim().replace(/[^\d.]/g, ''));
      return { length, width };
    } else if (sizeStr.includes('"')) {
      return { length: sizeStr.replace(/[^0-9.]/g, ''), width: "" };
    } else if (sizeStr.includes('cm')) {
      return { length: sizeStr.replace(/[^0-9.]/g, ''), width: "" };
    }
    return { length: "", width: "" };
  };

  const [dimensions, setDimensions] = useState(parseSize());

  // Get skill level directly from gear specifications
  const [skillLevel, setSkillLevel] = useState(equipment?.specifications?.suitable || "");
  const [images, setImages] = useState<File[]>([]);
  const [price, setPrice] = useState(equipment?.pricePerDay?.toString() || "");
  const [duration, setDuration] = useState("day");
  const [damageDeposit, setDamageDeposit] = useState("100"); // Default deposit
  const [role, setRole] = useState("private-party");

  // If no gear is found, redirect to My Gear page
  useEffect(() => {
    if (!equipment && id) {
      toast({
        title: "Gear Not Found",
        description: "The gear you're trying to edit could not be found.",
        variant: "destructive",
      });
      navigate("/my-gear");
    }
  }, [equipment, id, navigate, toast]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    toast({
      title: "Gear Updated",
      description: `${gearName} has been successfully updated.`,
    });

    // Navigate back to My Gear page
    navigate("/my-gear");
  };

  const handleCancel = () => {
    navigate("/my-gear");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <FormHeader title={equipment?.name || "Gear"} />

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
          currentImageUrl={equipment?.imageUrl}
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
          isEditing={true}
        />
      </form>
    </div>
  );
};

export default EditGearForm;
