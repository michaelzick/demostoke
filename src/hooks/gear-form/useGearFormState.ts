
import { useState } from "react";

export const useGearFormState = () => {
  const [gearName, setGearName] = useState("");
  const [gearType, setGearType] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState(""); // Changed from zipCode to address
  const [measurementUnit, setMeasurementUnit] = useState("");
  const [size, setSize] = useState("");
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
