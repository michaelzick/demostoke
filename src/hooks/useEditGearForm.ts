
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useEquipmentById } from "@/hooks/useEquipmentById";
import { useEditGearFormState } from "@/hooks/gear-form/useEditGearFormState";
import { useEquipmentDataLoader } from "@/hooks/gear-form/useEquipmentDataLoader";
import { useMultipleEditGearFormSubmission } from "@/hooks/gear-form/useMultipleEditGearFormSubmission";

export const useEditGearForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const { data: equipment, isLoading, error } = useEquipmentById(id || "");

  const formState = useEditGearFormState();

  // Load equipment data when available
  useEquipmentDataLoader({
    equipment: equipment ? {
      ...equipment,
      status: (equipment.status as 'available' | 'booked' | 'unavailable') || 'available',
      created_at: equipment.created_at || new Date().toISOString(),
      updated_at: equipment.updated_at || new Date().toISOString(),
      visible_on_map: equipment.visible_on_map !== undefined ? equipment.visible_on_map : true,
      review_count: equipment.review_count || 0
    } : undefined,
    setGearName: formState.setGearName,
    setGearType: formState.setGearType,
    setDescription: formState.setDescription,
    setZipCode: formState.setZipCode,
    setDimensions: formState.setDimensions,
    setSkillLevel: formState.setSkillLevel,
    setPricingOptions: formState.setPricingOptions,
    setDamageDeposit: formState.setDamageDeposit,
    setImageUrls: formState.setImageUrls,
    setMeasurementUnit: formState.setMeasurementUnit,
  });

  // Handle form submission using multiple image submission
  const { handleSubmit, handleCancel, isSubmitting } = useMultipleEditGearFormSubmission({
    equipment: equipment ? {
      ...equipment,
      status: (equipment.status as 'available' | 'booked' | 'unavailable') || 'available',
      created_at: equipment.created_at || new Date().toISOString(),
      updated_at: equipment.updated_at || new Date().toISOString(),
      visible_on_map: equipment.visible_on_map !== undefined ? equipment.visible_on_map : true,
      review_count: equipment.review_count || 0
    } : undefined,
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
    imageUrls: formState.imageUrls,
    useImageUrls: formState.useImageUrls,
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
