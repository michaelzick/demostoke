
import { useState } from "react";

export const useMultipleGearFormState = () => {
  const [gearName, setGearName] = useState("");
  const [gearType, setGearType] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState(""); // Changed from zipCode to address
  const [measurementUnit, setMeasurementUnit] = useState("inches");
  const [size, setSize] = useState("");
  const [skillLevel, setSkillLevel] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([""]);
  const [useImageUrls, setUseImageUrls] = useState(false);
  const [pricePerDay, setPricePerDay] = useState("");
  const [pricePerHour, setPricePerHour] = useState("");
  const [pricePerWeek, setPricePerWeek] = useState("");
  const [damageDeposit, setDamageDeposit] = useState("0");
  const [role, setRole] = useState("");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedSkillLevels, setSelectedSkillLevels] = useState<string[]>([]);

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
    address, // Added address
    setAddress, // Added setAddress
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
    role,
    setRole,
    selectedSizes,
    setSelectedSizes,
    selectedSkillLevels,
    setSelectedSkillLevels,
    handleImageUpload,
  };
};
