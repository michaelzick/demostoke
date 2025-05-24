
import React, { useEffect } from "react";
import { useEditGearForm } from "@/hooks/useEditGearForm";
import { useGearFormValidation } from "@/hooks/useGearFormValidation";

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
    navigate,
    toast,
  } = useEditGearForm();

  const { validateForm } = useGearFormValidation();

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = validateForm({
      gearName: formState.gearName,
      gearType: formState.gearType,
      description: formState.description,
      zipCode: formState.zipCode,
      measurementUnit: formState.measurementUnit,
      dimensions: formState.dimensions,
      skillLevel: formState.skillLevel,
      role: formState.role,
      damageDeposit: formState.damageDeposit,
      pricingOptions: formState.pricingOptions,
    });

    if (!isValid) return;

    toast({
      title: "Gear Updated",
      description: `${formState.gearName} has been successfully updated.`,
    });

    // Navigate back to My Gear page
    navigate("/my-gear");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <FormHeader title={equipment.name} />

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
        <GearBasicInfo
          gearName={formState.gearName}
          setGearName={formState.setGearName}
          gearType={formState.gearType}
          setGearType={formState.setGearType}
          description={formState.description}
          setDescription={formState.setDescription}
          role={formState.role}
          setRole={formState.setRole}
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
          currentImageUrl={equipment.image_url}
        />

        <GearPricing
          pricingOptions={formState.pricingOptions}
          setPricingOptions={formState.setPricingOptions}
          damageDeposit={formState.damageDeposit}
          setDamageDeposit={formState.setDamageDeposit}
        />

        <FormActions
          handleSubmit={handleSubmit}
          handleCancel={handlers.handleCancel}
          isEditing={true}
        />
      </form>
    </div>
  );
};

export default EditGearForm;
