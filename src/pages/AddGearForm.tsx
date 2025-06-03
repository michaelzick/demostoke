import React, { useEffect } from "react";
import FormHeader from "@/components/gear-form/FormHeader";
import GearBasicInfo from "@/components/gear-form/GearBasicInfo";
import GearSpecifications from "@/components/gear-form/GearSpecifications";
import GearMedia from "@/components/gear-form/GearMedia";
import GearPricing from "@/components/gear-form/GearPricing";
import FormActions from "@/components/gear-form/FormActions";
import { useAddGearForm } from "@/hooks/useAddGearForm";

const AddGearForm = () => {
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const {
    formState,
    handlers,
    isSubmitting,
    duplicatedImageUrl,
  } = useAddGearForm();

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <form onSubmit={handlers.handleSubmit} className="space-y-8">
        <FormHeader title="Add New Gear" />

        <GearBasicInfo
          gearName={formState.gearName}
          setGearName={formState.setGearName}
          gearType={formState.gearType}
          setGearType={formState.setGearType}
          description={formState.description}
          setDescription={formState.setDescription}
          zipCode={formState.zipCode}
          setZipCode={formState.setZipCode}
          locationName={formState.locationName}
          setLocationName={formState.setLocationName}
          lat={formState.lat}
          setLat={formState.setLat}
          lng={formState.lng}
          setLng={formState.setLng}
        />

        <GearSpecifications
          measurementUnit={formState.measurementUnit}
          setMeasurementUnit={formState.setMeasurementUnit}
          dimensions={formState.dimensions}
          setDimensions={formState.setDimensions}
          skillLevel={formState.skillLevel}
          setSkillLevel={formState.setSkillLevel}
          gearType={formState.gearType}
        />

        <GearMedia
          handleImageUpload={handlers.handleImageUpload}
          duplicatedImageUrl={duplicatedImageUrl}
        />

        <GearPricing
          pricingOptions={formState.pricingOptions}
          setPricingOptions={formState.setPricingOptions}
          damageDeposit={formState.damageDeposit}
          setDamageDeposit={formState.setDamageDeposit}
        />

        <FormActions
          handleSubmit={handlers.handleSubmit}
          handleCancel={handlers.handleCancel}
          isEditing={false}
          isSubmitting={isSubmitting}
        />
      </form>
    </div>
  );
};

export default AddGearForm;
