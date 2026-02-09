
import { useState } from "react";
import { UserFormData } from "./types";

export const useUserCreationForm = () => {
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    role: 'private-party',
    website: '',
    phone: '',
    address: '',
    about: '',
    gearCategory: '',
  });

  const [captchaToken, setCaptchaToken] = useState("");
  const [shouldResetCaptcha, setShouldResetCaptcha] = useState(false);

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCaptchaVerify = (token: string) => {
    setCaptchaToken(token);
    setShouldResetCaptcha(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'private-party',
      website: '',
      phone: '',
      address: '',
      about: '',
      gearCategory: '',
    });
    setCaptchaToken("");
    setShouldResetCaptcha(true);
  };

  const resetCaptcha = () => {
    setCaptchaToken("");
    setShouldResetCaptcha(true);
  };

  return {
    formData,
    captchaToken,
    shouldResetCaptcha,
    handleInputChange,
    handleCaptchaVerify,
    resetForm,
    resetCaptcha,
  };
};
