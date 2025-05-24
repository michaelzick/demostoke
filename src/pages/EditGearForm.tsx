
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useEquipmentById } from "@/hooks/useEquipmentById";

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

const EditGearForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();

  // Fetch the equipment by ID
  const { data: equipment, isLoading, error } = useEquipmentById(id || "");

  // Initialize state with equipment data or defaults
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

  // Parse size from specifications
  const parseSize = (sizeStr: string) => {
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

  // Map category to gear type that matches skillLevels keys
  const mapCategoryToGearType = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      "snowboards": "snowboard",
      "skis": "skis",
      "surfboards": "surfboard",
      "sups": "sup",
      "skateboards": "skateboard"
    };
    return categoryMap[category.toLowerCase()] || category.slice(0, -1);
  };

  // Map skill level from database to dropdown options
  const mapSkillLevel = (dbSkillLevel: string, gearType: string) => {
    if (!dbSkillLevel || !gearType) return "";
    
    const skillLevels = {
      snowboard: ["Beginner", "Intermediate", "Advanced", "Park Rider"],
      skis: ["Beginner", "Intermediate", "Advanced", "Park Rider"],
      surfboard: ["Beginner", "Intermediate", "Advanced", "All Levels"],
      sup: ["Flat Water", "Surf", "Racing", "Yoga"],
      skateboard: ["Beginner", "Intermediate", "Advanced", "All Levels"],
    };

    const validLevels = skillLevels[gearType as keyof typeof skillLevels] || [];
    
    // Try exact match first
    if (validLevels.includes(dbSkillLevel)) {
      return dbSkillLevel;
    }
    
    // Try case-insensitive match
    const matchedLevel = validLevels.find(level => 
      level.toLowerCase() === dbSkillLevel.toLowerCase()
    );
    
    return matchedLevel || "";
  };

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

  // Handle loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-xl font-medium mb-2">Loading gear...</h2>
        </div>
      </div>
    );
  }

  // Handle error or equipment not found
  if (error || !equipment) {
    useEffect(() => {
      toast({
        title: "Gear Not Found",
        description: "The gear you're trying to edit could not be found.",
        variant: "destructive",
      });
      navigate("/my-gear");
    }, []);

    return null;
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

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
      <FormHeader title={equipment.name} />

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
          currentImageUrl={equipment.image_url}
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
          isEditing={true}
        />
      </form>
    </div>
  );
};

export default EditGearForm;
