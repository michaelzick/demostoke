
import { useState } from "react";
import { PricingOption } from "./types";

export const useMultipleGearFormState = () => {
  const [gearName, setGearName] = useState("");
  const [gearType, setGearType] = useState("");
  const [description, setDescription] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [measurementUnit, setMeasurementUnit] = useState("cm");
  const [dimensions, setDimensions] = useState({
    length: "",
    width: "",
    thickness: "",
  });
  const [skillLevel, setSkillLevel] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [pricingOptions, setPricingOptions] = useState<PricingOption[]>([
    { price: "", duration: "day" },
  ]);
  const [damageDeposit, setDamageDeposit] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([""]);
  const [useImageUrls, setUseImageUrls] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(files);
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
    imageUrls,
    setImageUrls,
    useImageUrls,
    setUseImageUrls,
    handleImageUpload,
  };
};
