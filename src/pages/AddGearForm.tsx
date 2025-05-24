
import React from "react";
import { useAddGearForm } from "@/hooks/useAddGearForm";

// Import form section components
import FormHeader from "@/components/gear-form/FormHeader";
import GearBasicInfo from "@/components/gear-form/GearBasicInfo";
import GearSpecifications from "@/components/gear-form/GearSpecifications";
import GearMedia from "@/components/gear-form/GearMedia";
import GearPricing from "@/components/gear-form/GearPricing";
import FormActions from "@/components/gear-form/FormActions";

const AddGearForm = () => {
  const {
    isAuthenticated,
    formState,
    handlers,
    isSubmitting,
  } = useAddGearForm();

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <FormHeader title="List Your Gear" />

      <form onSubmit={handlers.handleSubmit} className="max-w-2xl mx-auto space-y-6">
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
