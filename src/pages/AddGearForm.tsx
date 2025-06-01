
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/helpers";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import FormHeader from "@/components/gear-form/FormHeader";
import GearBasicInfo from "@/components/gear-form/GearBasicInfo";
import GearSpecifications from "@/components/gear-form/GearSpecifications";
import GearMedia from "@/components/gear-form/GearMedia";
import GearPricing from "@/components/gear-form/GearPricing";
import FormActions from "@/components/gear-form/FormActions";
import { useAddGearForm } from "@/hooks/useAddGearForm";

const AddGearForm = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const {
    formState,
    handlers,
    isSubmitting,
    duplicatedImageUrl,
  } = useAddGearForm();

  const handleManualEntry = () => {
    // Already on manual entry page, do nothing
  };

  const handleLightspeedPOS = () => {
    if (isAuthenticated) {
      navigate("/list-gear/lightspeed-pos");
    } else {
      navigate("/auth/signin");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-6 text-center">List Your Gear</h1>
        <div className="flex justify-center mb-8">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="lg" className="flex items-center gap-2">
                List Your Gear
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem onClick={handleManualEntry}>
                Manual Entry
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  Sync With POS
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={handleLightspeedPOS}>
                    Lightspeed POS
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

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
    </div>
  );
};

export default AddGearForm;
