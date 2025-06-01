
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/helpers";
import { ArrowLeft, Home, Upload, Sync } from "lucide-react";
import { Link } from "react-router-dom";
import FormHeader from "@/components/gear-form/FormHeader";
import GearBasicInfo from "@/components/gear-form/GearBasicInfo";
import GearSpecifications from "@/components/gear-form/GearSpecifications";
import GearMedia from "@/components/gear-form/GearMedia";
import GearPricing from "@/components/gear-form/GearPricing";
import FormActions from "@/components/gear-form/FormActions";
import { useAddGearForm } from "@/hooks/useAddGearForm";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
      navigate("/lightspeed-pos");
    } else {
      navigate("/auth/signin");
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <GearListingSidebar 
          onManualEntry={handleManualEntry}
          onLightspeedPOS={handleLightspeedPOS}
        />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8 max-w-2xl">
            <div className="flex items-center gap-4 mb-6">
              <Button variant="ghost" asChild>
                <Link to="/my-gear" className="flex items-center">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Return to My Gear
                </Link>
              </Button>
              <SidebarTrigger />
            </div>

            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-6 text-left">List Your Gear</h1>
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
        </main>
      </div>
    </SidebarProvider>
  );
};

const GearListingSidebar = ({ onManualEntry, onLightspeedPOS }: {
  onManualEntry: () => void;
  onLightspeedPOS: () => void;
}) => {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>List Your Gear</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={onManualEntry}>
                  <Upload />
                  <span>Manual Entry</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <Collapsible className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <Sync />
                      <span>Sync With POS</span>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton onClick={onLightspeedPOS}>
                          <span>Lightspeed POS</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AddGearForm;
