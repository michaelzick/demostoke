
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useEquipmentById } from "@/hooks/useEquipmentById";
import { useEditGearFormState } from "@/hooks/gear-form/useEditGearFormState";
import { useEquipmentDataLoader } from "@/hooks/gear-form/useEquipmentDataLoader";
import { useEditGearFormSubmission } from "@/hooks/gear-form/useEditGearFormSubmission";

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
    setPricingOptions: formState.setPricingOptions,
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
  });

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
