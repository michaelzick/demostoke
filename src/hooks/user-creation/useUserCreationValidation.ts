
import { useMemo } from "react";
import { UserFormData } from "./types";

export const useUserCreationValidation = (formData: UserFormData, captchaToken: string) => {
  const isFormValid = useMemo((): boolean => {
    return !!(formData.name && 
           formData.email && 
           formData.password && 
           formData.password.length >= 6 &&
           formData.role &&
           captchaToken);
  }, [formData.name, formData.email, formData.password, formData.role, captchaToken]);

  return { isFormValid };
};
