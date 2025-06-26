
import React, { useEffect } from "react";
import FormHeader from "@/components/gear-form/FormHeader";
import GearBasicInfo from "@/components/gear-form/GearBasicInfo";
import GearSpecifications from "@/components/gear-form/GearSpecifications";
import MultipleGearMedia from "@/components/gear-form/MultipleGearMedia";
import GearPricing from "@/components/gear-form/GearPricing";
import FormActions from "@/components/gear-form/FormActions";
import { useMultipleGearFormState } from "@/hooks/gear-form/useMultipleGearFormState";
import { useMultipleGearFormSubmission } from "@/hooks/gear-form/useMultipleGearFormSubmission";
import { useDuplicatedGearDataForMultiple } from "@/hooks/gear-form/useDuplicatedGearDataForMultiple";
import { useAuth } from "@/helpers";

const AddGearForm = () => {
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { user } = useAuth();
  const formState = useMultipleGearFormState();

  // Handle duplicated gear data
  useDuplicatedGearDataForMultiple({
    setGearName: formState.setGearName,
    setGearType: formState.setGearType,
    setDescription: formState.setDescription,
    setZipCode: formState.setZipCode,
    setMeasurementUnit: formState.setMeasurementUnit,
    setDimensions: formState.setDimensions,
    setSkillLevel: formState.setSkillLevel,
    setPricingOptions: formState.setPricingOptions,
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
    dimensions: formState.dimensions,
    skillLevel: formState.skillLevel,
    images: formState.images,
    pricingOptions: formState.pricingOptions,
    damageDeposit: formState.damageDeposit,
    role: user?.role || "private-party",
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
          dimensions={formState.dimensions}
          setDimensions={formState.setDimensions}
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
        />

        <GearPricing
          pricePerDay={formState.pricingOptions.find(p => p.duration === 'day')?.price || ''}
          setPricePerDay={(value) => {
            const updatedOptions = formState.pricingOptions.filter(p => p.duration !== 'day');
            if (value.trim()) {
              updatedOptions.push({ id: 'day', price: value, duration: 'day' });
            }
            formState.setPricingOptions(updatedOptions);
          }}
          pricePerHour={formState.pricingOptions.find(p => p.duration === 'hour')?.price || ''}
          setPricePerHour={(value) => {
            const updatedOptions = formState.pricingOptions.filter(p => p.duration !== 'hour');
            if (value.trim()) {
              updatedOptions.push({ id: 'hour', price: value, duration: 'hour' });
            }
            formState.setPricingOptions(updatedOptions);
          }}
          pricePerWeek={formState.pricingOptions.find(p => p.duration === 'week')?.price || ''}
          setPricePerWeek={(value) => {
            const updatedOptions = formState.pricingOptions.filter(p => p.duration !== 'week');
            if (value.trim()) {
              updatedOptions.push({ id: 'week', price: value, duration: 'week' });
            }
            formState.setPricingOptions(updatedOptions);
          }}
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
