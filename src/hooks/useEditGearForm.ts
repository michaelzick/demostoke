import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useEquipmentById } from "@/hooks/useEquipmentById";
import { useEditGearFormState } from "@/hooks/gear-form/useEditGearFormState";
import { useEquipmentDataLoader } from "@/hooks/gear-form/useEquipmentDataLoader";
import { useEditGearFormSubmission } from "@/hooks/gear-form/useEditGearFormSubmission";
import { geocodeLocation } from "@/utils/mapboxGeocode";
import { useEffect } from "react";

export const useEditGearForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const { data: equipment, isLoading, error } = useEquipmentById(id || "");

  const formState = useEditGearFormState();

  // Load equipment data when available
  useEquipmentDataLoader({
    equipment,
    setGearName: formState.setGearName,
    setGearType: formState.setGearType,
    setDescription: formState.setDescription,
    setZipCode: formState.setZipCode,
    setDimensions: formState.setDimensions,
    setSkillLevel: formState.setSkillLevel,
    setPricingOptions: formState.setPricingOptions
  });

  // Handle form submission
  const { handleSubmit, handleCancel, isSubmitting } = useEditGearFormSubmission({
    equipment,
    gearName: formState.gearName,
    gearType: formState.gearType,
    description: formState.description,
    zipCode: formState.zipCode,
    measurementUnit: formState.measurementUnit,
    dimensions: formState.dimensions,
    skillLevel: formState.skillLevel,
    images: formState.images,
    pricingOptions: formState.pricingOptions,
    damageDeposit: formState.damageDeposit,
    lat: formState.lat,
    lng: formState.lng,
  });

  // Geocode zipCode to lat/lng when it changes
  // (Debounced for UX, but here we use useEffect for simplicity)

  // >>> New comment to trigger Lovable rebuild <<<
  useEffect(() => {
    async function doGeocode() {
      if (formState.zipCode) {
        const geo = await geocodeLocation(formState.zipCode + ", USA");
        if (geo) {
          formState.setLat(geo.lat);
          formState.setLng(geo.lng);
        }
      }
    }
    doGeocode();
    // Only run when zipCode changes
  }, [formState.zipCode, formState]);

  return {
    equipment,
    isLoading,
    error,
    formState,
    handlers: {
      handleImageUpload: formState.handleImageUpload,
      handleCancel,
      handleSubmit,
    },
    isSubmitting,
    navigate,
    toast,
  };
};
