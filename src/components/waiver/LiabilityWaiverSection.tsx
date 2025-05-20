
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn } from "react-hook-form";
import { Equipment } from "@/types";
import FormSection from "./FormSection";
import RequiredIndicator from "./RequiredIndicator";
import { FormValues } from "./types";

interface LiabilityWaiverSectionProps {
  form: UseFormReturn<FormValues>;
  equipment: Equipment;
}

const LiabilityWaiverSection = ({ form, equipment }: LiabilityWaiverSectionProps) => {
  return (
    <FormSection>
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
    </FormSection>
  );
};

export default LiabilityWaiverSection;
