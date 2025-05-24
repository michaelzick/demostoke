
import { useState } from "react";
import { PricingOption } from "./types";

export const useEditGearFormState = () => {
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  return {
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
    handleImageUpload,
  };
};
