
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import SignatureField from "@/components/SignatureField";
import { Equipment } from "@/types";
import { toast } from "@/hooks/use-toast";
import CustomerInfoSection from "./CustomerInfoSection";
import NotesSection from "./NotesSection";
import LiabilityWaiverSection from "./LiabilityWaiverSection";
import { FormValues, formSchema } from "./types";

interface CustomerWaiverFormProps {
  equipment: Equipment;
  onComplete: () => void;
}

const CustomerWaiverForm = ({ equipment, onComplete }: CustomerWaiverFormProps) => {
  const [signature, setSignature] = useState<string | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      emergencyContact: "",
      emergencyPhone: "",
      acceptTerms: false,
      additionalNotes: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    if (!signature) {
      toast({
        title: "Signature Required",
        description: "Please sign the waiver form to continue.",
        variant: "destructive",
      });
      return;
    }

    // Simulating form submission
    
    toast({
      title: "Waiver Submitted",
      description: "Your information and waiver have been successfully submitted.",
    });
    
    onComplete();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Customer Information & Liability Waiver</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Please complete this form to continue with your demo request for {equipment.name}.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Customer Information Section */}
          <CustomerInfoSection form={form} />

          {/* Additional Notes Section */}
          <NotesSection form={form} />

          {/* Liability Waiver Section */}
          <LiabilityWaiverSection form={form} equipment={equipment} />

          {/* Signature Field */}
          <SignatureField 
            onSignatureChange={setSignature} 
            label="Digital Signature"
            required
          />
          
          <Button type="submit" className="w-full mt-4">
            Submit & Continue
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default CustomerWaiverForm;
