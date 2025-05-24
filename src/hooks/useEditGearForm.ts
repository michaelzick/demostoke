
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useEquipmentById } from "@/hooks/useEquipmentById";
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
    },
    navigate,
    toast,
  };
};
