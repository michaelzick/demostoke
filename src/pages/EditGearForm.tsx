
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useEquipmentById } from "@/hooks/useEquipmentById";
import { useEditGearFormState } from "@/hooks/gear-form/useEditGearFormState";
import { useMultipleEditGearFormSubmission } from "@/hooks/gear-form/useMultipleEditGearFormSubmission";
import { useEquipmentDataLoader } from "@/hooks/gear-form/useEquipmentDataLoader";
import { fetchEquipmentImages } from "@/utils/multipleImageHandling";

// Import form section components
import FormHeader from "@/components/gear-form/FormHeader";
import GearBasicInfo from "@/components/gear-form/GearBasicInfo";
import GearSpecifications from "@/components/gear-form/GearSpecifications";
import MultipleGearMedia from "@/components/gear-form/MultipleGearMedia";
import GearPricing from "@/components/gear-form/GearPricing";
import FormActions from "@/components/gear-form/FormActions";

const EditGearForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: equipment, isLoading, error } = useEquipmentById(id || "");
  const formState = useEditGearFormState();
  const [currentImages, setCurrentImages] = useState<string[]>([]);

  // Load equipment data when available using the centralized data loader
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
    setSize: formState.setSize,
    setSkillLevel: formState.setSkillLevel,
    setPricePerDay: formState.setPricePerDay,
    setPricePerHour: formState.setPricePerHour,
    setPricePerWeek: formState.setPricePerWeek,
    setDamageDeposit: formState.setDamageDeposit,
    setImageUrl: formState.setImageUrl,
    setMeasurementUnit: formState.setMeasurementUnit,
    setSelectedSkillLevels: formState.setSelectedSkillLevels,
    setSelectedSizes: formState.setSelectedSizes,
  });

  // Fetch current images when equipment is loaded
  useEffect(() => {
    const loadCurrentImages = async () => {
      if (equipment?.id) {
        try {
          const images = await fetchEquipmentImages(equipment.id);
          setCurrentImages(images.length > 0 ? images : equipment.image_url ? [equipment.image_url] : []);
        } catch (error) {
          console.error('Error fetching current images:', error);
          setCurrentImages(equipment.image_url ? [equipment.image_url] : []);
        }
      }
    };

    loadCurrentImages();
  }, [equipment?.id, equipment?.image_url]);

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
    size: formState.size,
    skillLevel: formState.skillLevel,
    images: formState.images,
    pricePerDay: formState.pricePerDay,
    pricePerHour: formState.pricePerHour,
    pricePerWeek: formState.pricePerWeek,
    damageDeposit: formState.damageDeposit,
    imageUrls: formState.imageUrls,
    useImageUrls: formState.useImageUrls,
    selectedSizes: formState.selectedSizes,
  });

  // Handle error navigation
  useEffect(() => {
    if (error || (!isLoading && !equipment)) {
      toast({
        title: "Gear Not Found",
        description: "The gear you're trying to edit could not be found.",
        variant: "destructive",
      });
      navigate("/my-gear");
    }
  }, [error, equipment, isLoading, toast, navigate]);

  // Handle loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-xl font-medium mb-2">Loading gear...</h2>
        </div>
      </div>
    );
  }

  // Don't render form if there's no equipment data
  if (!equipment) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
        <FormHeader title={`Edit ${equipment.name}`} route='/my-gear' buttonText='Back to My Gear Page' />

        <GearBasicInfo
          gearName={formState.gearName}
          setGearName={formState.setGearName}
          gearType={formState.gearType}
          setGearType={formState.setGearType}
          description={formState.description}
          setDescription={formState.setDescription}
          zipCode={formState.zipCode}
          setZipCode={formState.setZipCode}
        />

        <GearSpecifications
          size={formState.size}
          setSize={formState.setSize}
          skillLevel={formState.skillLevel}
          setSkillLevel={formState.setSkillLevel}
          gearType={formState.gearType}
          selectedSizes={formState.selectedSizes}
          setSelectedSizes={formState.setSelectedSizes}
          selectedSkillLevels={formState.selectedSkillLevels}
          setSelectedSkillLevels={formState.setSelectedSkillLevels}
        />

        <MultipleGearMedia
          handleMultipleImageUpload={formState.handleMultipleImageUpload}
          currentImages={currentImages}
          imageUrls={formState.imageUrls}
          setImageUrls={formState.setImageUrls}
          useImageUrls={formState.useImageUrls}
          setUseImageUrls={formState.setUseImageUrls}
          selectedFiles={formState.images}
          setSelectedFiles={formState.setImages}
        />

        <GearPricing
          pricePerDay={formState.pricePerDay}
          setPricePerDay={formState.setPricePerDay}
          pricePerHour={formState.pricePerHour}
          setPricePerHour={formState.setPricePerHour}
          pricePerWeek={formState.pricePerWeek}
          setPricePerWeek={formState.setPricePerWeek}
          damageDeposit={formState.damageDeposit}
          setDamageDeposit={formState.setDamageDeposit}
        />

        <FormActions
          handleSubmit={handleSubmit}
          handleCancel={handleCancel}
          isEditing={true}
          isSubmitting={isSubmitting}
        />
      </form>
    </div>
  );
};

export default EditGearForm;
