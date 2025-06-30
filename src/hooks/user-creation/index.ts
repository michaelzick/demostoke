
import { useUserCreationForm } from "./useUserCreationForm";
import { useUserCreationValidation } from "./useUserCreationValidation";
import { useUserCreationSubmission } from "./useUserCreationSubmission";

export const useManualUserCreation = () => {
  const {
    formData,
    captchaToken,
    shouldResetCaptcha,
    handleInputChange,
    handleCaptchaVerify,
    resetForm,
    resetCaptcha,
  } = useUserCreationForm();

  const { isFormValid } = useUserCreationValidation(formData, captchaToken);
  const { isCreating, createUser: createUserSubmission } = useUserCreationSubmission();

  const createUser = async () => {
    await createUserSubmission(formData, captchaToken, isFormValid, resetForm, resetCaptcha);
  };

  return {
    formData,
    isCreating,
    captchaToken,
    shouldResetCaptcha,
    isFormValid,
    handleInputChange,
    handleCaptchaVerify,
    createUser,
    resetCaptcha
  };
};
