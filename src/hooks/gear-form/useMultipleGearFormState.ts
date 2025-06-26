
import { useState, ChangeEvent } from "react";

export const useMultipleGearFormState = () => {
  const [gearName, setGearName] = useState("");
  const [gearType, setGearType] = useState("");
  const [description, setDescription] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [measurementUnit, setMeasurementUnit] = useState("");
  const [size, setSize] = useState("");
  const [skillLevel, setSkillLevel] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([""]);
  const [useImageUrls, setUseImageUrls] = useState(false);
  const [pricePerDay, setPricePerDay] = useState("");
  const [pricePerHour, setPricePerHour] = useState("");
  const [pricePerWeek, setPricePerWeek] = useState("");
  const [damageDeposit, setDamageDeposit] = useState("");
  
  // New fields for multiple sizes and skill levels
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedSkillLevels, setSelectedSkillLevels] = useState<string[]>([]);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
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
    size,
    setSize,
    skillLevel,
    setSkillLevel,
    images,
    setImages,
    imageUrls,
    setImageUrls,
    useImageUrls,
    setUseImageUrls,
    pricePerDay,
    setPricePerDay,
    pricePerHour,
    setPricePerHour,
    pricePerWeek,
    setPricePerWeek,
    damageDeposit,
    setDamageDeposit,
    selectedSizes,
    setSelectedSizes,
    selectedSkillLevels,
    setSelectedSkillLevels,
    handleImageUpload,
  };
};
