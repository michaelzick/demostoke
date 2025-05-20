
import { FormLabel } from "@/components/ui/form";
import { ReactNode } from "react";

interface FormSectionProps {
  title?: string;
  children: ReactNode;
}

const FormSection = ({ title, children }: FormSectionProps) => {
  return (
    <div className="space-y-4">
      {title && <h4 className="font-medium">{title}</h4>}
      {children}
    </div>
  );
};

export default FormSection;
