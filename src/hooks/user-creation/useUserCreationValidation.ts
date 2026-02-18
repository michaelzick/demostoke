
import { useMemo } from "react";
import { UserFormData } from "./types";

export const useUserCreationValidation = (formData: UserFormData) => {
  const isFormValid = useMemo((): boolean => {
    const baseValid = !!(formData.name && 
           formData.email && 
           formData.password && 
           formData.password.length >= 6 &&
           formData.role);
    
    if (formData.role === 'retail-store' || formData.role === 'builder') {
      return baseValid && !!formData.gearCategory;
    }
    return baseValid;
  }, [formData.name, formData.email, formData.password, formData.role, formData.gearCategory]);

  return { isFormValid };
};
