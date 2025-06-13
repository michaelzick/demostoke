
import { useState } from "react";
import { PricingOption } from "./types";

export const useEditGearFormState = () => {
  const [gearName, setGearName] = useState("");
  const [gearType, setGearType] = useState("");
  const [description, setDescription] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [measurementUnit, setMeasurementUnit] = useState("inches");
  const [dimensions, setDimensions] = useState({ length: "", width: "", thickness: "" });
  const [skillLevel, setSkillLevel] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [useImageUrl, setUseImageUrl] = useState(false);
  const [pricingOptions, setPricingOptions] = useState<PricingOption[]>([
    { price: "", duration: "day" }
  ]);
  const [damageDeposit, setDamageDeposit] = useState("100");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  // Create a wrapper for setDimensions to handle the optional thickness
  const handleSetDimensions = (value: { length: string; width: string; thickness?: string }) => {
    setDimensions({
      length: value.length,
      width: value.width,
      thickness: value.thickness || ""
    });
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
    setDimensions: handleSetDimensions,
    skillLevel,
    setSkillLevel,
    images,
    setImages,
    imageUrl,
    setImageUrl,
    useImageUrl,
    setUseImageUrl,
    pricingOptions,
    setPricingOptions,
    damageDeposit,
    setDamageDeposit,
    handleImageUpload,
  };
};
