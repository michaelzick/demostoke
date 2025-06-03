import React, { useEffect } from "react";
import { useEditGearForm } from "@/hooks/useEditGearForm";

// Import form section components
import FormHeader from "@/components/gear-form/FormHeader";
import GearBasicInfo from "@/components/gear-form/GearBasicInfo";
import GearSpecifications from "@/components/gear-form/GearSpecifications";
import GearMedia from "@/components/gear-form/GearMedia";
import GearPricing from "@/components/gear-form/GearPricing";
import FormActions from "@/components/gear-form/FormActions";

const EditGearForm = () => {
  const {
    equipment,
    isLoading,
    error,
    formState,
    handlers,
    isSubmitting,
    navigate,
    toast,
  } = useEditGearForm();

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

  // Handle error or equipment not found
  if (error || !equipment) {
    useEffect(() => {
      toast({
        title: "Gear Not Found",
        description: "The gear you're trying to edit could not be found.",
        variant: "destructive",
      });
      navigate("/my-gear");
    }, []);

    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <FormHeader title={equipment.name} />

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
          currentImageUrl={equipment.image_url}
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
          isEditing={true}
          isSubmitting={isSubmitting}
        />
      </form>
    </div>
  );
};

export default EditGearForm;
