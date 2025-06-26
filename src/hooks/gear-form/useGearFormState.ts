
import { useState } from "react";

export const useGearFormState = () => {
  const [gearName, setGearName] = useState("");
  const [gearType, setGearType] = useState("");
  const [description, setDescription] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [measurementUnit, setMeasurementUnit] = useState("");
  const [dimensions, setDimensions] = useState<{ length: string; width: string; thickness?: string }>({ length: "", width: "", thickness: "" });
  const [skillLevel, setSkillLevel] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [useImageUrl, setUseImageUrl] = useState(false);
  const [pricePerDay, setPricePerDay] = useState("");
  const [pricePerHour, setPricePerHour] = useState("");
  const [pricePerWeek, setPricePerWeek] = useState("");
  const [damageDeposit, setDamageDeposit] = useState("");
  const [role, setRole] = useState("");

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
  };
};
