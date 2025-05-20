
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import FormSection from "./FormSection";
import { FormValues } from "./types";

interface NotesSectionProps {
  form: UseFormReturn<FormValues>;
}

const NotesSection = ({ form }: NotesSectionProps) => {
  return (
    <FormSection>
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
    </FormSection>
  );
};

export default NotesSection;
