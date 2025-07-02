
import { useState } from "react";

export const useEditGearFormState = () => {
  const [gearName, setGearName] = useState("");
  const [gearType, setGearType] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState(""); // Changed from zipCode to address
  const [measurementUnit, setMeasurementUnit] = useState("inches");
  const [size, setSize] = useState("");
  const [skillLevel, setSkillLevel] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [useImageUrl, setUseImageUrl] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([""]);
  const [useImageUrls, setUseImageUrls] = useState(false);
  const [pricePerDay, setPricePerDay] = useState("");
  const [pricePerHour, setPricePerHour] = useState("");
  const [pricePerWeek, setPricePerWeek] = useState("");
  const [damageDeposit, setDamageDeposit] = useState("0");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedSkillLevels, setSelectedSkillLevels] = useState<string[]>([]);

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
    address, // Changed from zipCode to address
    setAddress, // Changed from setZipCode to setAddress
    measurementUnit,
    setMeasurementUnit,
    size,
    setSize,
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
    handleMultipleImageUpload,
  };
};
