
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import SignatureField from "@/components/SignatureField";
import { Equipment } from "@/types";
import { toast } from "@/hooks/use-toast";

const formSchema = z.object({
  fullName: z.string().min(2, { message: "Full name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().min(10, { message: "Phone number is required" }),
  address: z.string().min(5, { message: "Address is required" }),
  emergencyContact: z.string().min(2, { message: "Emergency contact is required" }),
  emergencyPhone: z.string().min(10, { message: "Emergency contact phone is required" }),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "You must accept the terms"
  }),
  additionalNotes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

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
    console.log("Form Data:", { ...data, signature });
    
    toast({
      title: "Waiver Submitted",
      description: "Your information and waiver have been successfully submitted.",
    });
    
    onComplete();
  };

  // Required field indicator component
  const RequiredIndicator = () => (
    <span className="text-[#ea384c] ml-1">*</span>
  );

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name<RequiredIndicator /></FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email<RequiredIndicator /></FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="your@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number<RequiredIndicator /></FormLabel>
                  <FormControl>
                    <Input placeholder="(555) 123-4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address<RequiredIndicator /></FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main St, City, State" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emergencyContact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Emergency Contact<RequiredIndicator /></FormLabel>
                  <FormControl>
                    <Input placeholder="Contact Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emergencyPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Emergency Contact Phone<RequiredIndicator /></FormLabel>
                  <FormControl>
                    <Input placeholder="(555) 987-6543" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="additionalNotes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Notes</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Any medical conditions, special requirements, or other information we should know"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <h4 className="font-medium">Liability Waiver & Terms</h4>
            <div className="text-sm space-y-2">
              <p>
                I, the undersigned, acknowledge that I am voluntarily requesting to demo equipment from DemoStoke. I understand that outdoor activities carry inherent risks that may result in injury or death.
              </p>
              <p>
                By signing this waiver, I agree to assume all risks associated with the use of the {equipment.name} and related equipment. I release DemoStoke, its owners, employees, and partners from all liability related to any injury or damage that may occur during my use of the equipment.
              </p>
              <p>
                I affirm that I have the necessary skills and knowledge to safely use the equipment, or will receive proper instruction before use. I agree to use the equipment only in conditions appropriate for my skill level.
              </p>
              <p>
                I agree to return all equipment in the same condition as received, and accept financial responsibility for any damage beyond normal wear and tear.
              </p>
            </div>
            
            <FormField
              control={form.control}
              name="acceptTerms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      I have read and accept the terms and conditions<RequiredIndicator />
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </div>

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
