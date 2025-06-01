
import React from "react";
import FormHeader from "@/components/gear-form/FormHeader";
import GearBasicInfo from "@/components/gear-form/GearBasicInfo";
import GearSpecifications from "@/components/gear-form/GearSpecifications";
import GearMedia from "@/components/gear-form/GearMedia";
import GearPricing from "@/components/gear-form/GearPricing";
import FormActions from "@/components/gear-form/FormActions";
import { useAddGearForm } from "@/hooks/useAddGearForm";
import ListGearHeader from "@/components/gear-listing/ListGearHeader";

const AddGearForm = () => {
  const {
    formState,
    handlers,
    isSubmitting,
    duplicatedImageUrl,
  } = useAddGearForm();

  return (
    <ListGearHeader currentPage="manual">
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
    </ListGearHeader>
  );
};

export default AddGearForm;
