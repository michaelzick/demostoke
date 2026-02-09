
import { useMemo } from "react";
import { UserFormData } from "./types";

export const useUserCreationValidation = (formData: UserFormData, captchaToken: string) => {
  const isFormValid = useMemo((): boolean => {
    const baseValid = !!(formData.name && 
           formData.email && 
           formData.password && 
           formData.password.length >= 6 &&
           formData.role &&
           captchaToken);
    
    if (formData.role === 'retail-store') {
      return baseValid && !!formData.gearCategory;
    }
    return baseValid;
  }, [formData.name, formData.email, formData.password, formData.role, formData.gearCategory, captchaToken]);

  return { isFormValid };
};
