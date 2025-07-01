import React, { useEffect } from "react";
import usePageMetadata from "@/hooks/usePageMetadata";
import FormHeader from "@/components/gear-form/FormHeader";
import GearBasicInfo from "@/components/gear-form/GearBasicInfo";
import GearSpecifications from "@/components/gear-form/GearSpecifications";
import MultipleGearMedia from "@/components/gear-form/MultipleGearMedia";
import GearPricing from "@/components/gear-form/GearPricing";
import FormActions from "@/components/gear-form/FormActions";
import { useMultipleGearFormState } from "@/hooks/gear-form/useMultipleGearFormState";
import { useMultipleGearFormSubmission } from "@/hooks/gear-form/useMultipleGearFormSubmission";
import { useDuplicatedGearData } from "@/hooks/gear-form/useDuplicatedGearData";
import { useAuth } from "@/helpers";

const AddGearForm = () => {
  usePageMetadata({
    title: 'Add Gear | DemoStoke',
    description: 'List new gear for rent or demo on DemoStoke.'
  });
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { user } = useAuth();
  const formState = useMultipleGearFormState();

  // Handle duplicated gear data using the correct hook that reads from sessionStorage
  useDuplicatedGearData({
    setGearName: formState.setGearName,
    setGearType: formState.setGearType,
    setDescription: formState.setDescription,
    setZipCode: formState.setZipCode,
    setMeasurementUnit: formState.setMeasurementUnit,
    setSize: formState.setSize,
    setRole: formState.setRole,
    setSkillLevel: formState.setSkillLevel,
    setPricePerDay: formState.setPricePerDay,
    setPricePerHour: formState.setPricePerHour,
    setPricePerWeek: formState.setPricePerWeek,
    setDamageDeposit: formState.setDamageDeposit,
    setImageUrls: formState.setImageUrls,
    setUseImageUrls: formState.setUseImageUrls,
  });

  const { handleSubmit, isSubmitting } = useMultipleGearFormSubmission({
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
    role: formState.role,
    imageUrls: formState.imageUrls,
    useImageUrls: formState.useImageUrls,
  });

  const handleCancel = () => {
    window.history.back();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-8">
        <FormHeader title="Add New Gear" route='/list-your-gear' buttonText='Back to List Gear Page' />

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
          handleMultipleImageUpload={formState.handleImageUpload}
          imageUrls={formState.imageUrls}
          setImageUrls={formState.setImageUrls}
          useImageUrls={formState.useImageUrls}
          setUseImageUrls={formState.setUseImageUrls}
          selectedFiles={formState.images}
          setSelectedFiles={formState.setImages}
          gearName={formState.gearName}
          gearType={formState.gearType}
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
          isEditing={false}
          isSubmitting={isSubmitting}
        />
      </form>
    </div>
  );
};

export default AddGearForm;
