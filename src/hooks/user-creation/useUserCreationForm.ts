
import { useState } from "react";
import { UserFormData } from "./types";

export const useUserCreationForm = () => {
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    role: 'retail-store',
    website: '',
    phone: '',
    address: '',
    about: '',
    gearCategory: '',
  });

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'retail-store',
      website: '',
      phone: '',
      address: '',
      about: '',
      gearCategory: '',
    });
  };

  return {
    formData,
    handleInputChange,
    resetForm,
  };
};
