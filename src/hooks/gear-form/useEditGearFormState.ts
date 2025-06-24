
import { useState } from "react";
import { PricingOption } from "./types";

export const useEditGearFormState = () => {
  const [gearName, setGearName] = useState("");
  const [gearType, setGearType] = useState("");
  const [description, setDescription] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [measurementUnit, setMeasurementUnit] = useState("inches");
  const [dimensions, setDimensions] = useState<{ length: string; width: string; thickness?: string }>({ 
    length: "", 
    width: "", 
    thickness: "" 
  });
  const [skillLevel, setSkillLevel] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [useImageUrl, setUseImageUrl] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([""]);
  const [useImageUrls, setUseImageUrls] = useState(false);
  const [pricingOptions, setPricingOptions] = useState<PricingOption[]>([
    { price: "", duration: "day" }
  ]);
  const [damageDeposit, setDamageDeposit] = useState("100");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleMultipleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    imageUrl,
    setImageUrl,
    useImageUrl,
    setUseImageUrl,
    imageUrls,
    setImageUrls,
    useImageUrls,
    setUseImageUrls,
    pricingOptions,
    setPricingOptions,
    damageDeposit,
    setDamageDeposit,
    selectedSizes,
    setSelectedSizes,
    handleImageUpload,
    handleMultipleImageUpload,
  };
};
