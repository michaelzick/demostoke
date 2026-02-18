
import { useUserCreationForm } from "./useUserCreationForm";
import { useUserCreationValidation } from "./useUserCreationValidation";
import { useUserCreationSubmission } from "./useUserCreationSubmission";

export const useManualUserCreation = () => {
  const {
    formData,
    handleInputChange,
    resetForm,
  } = useUserCreationForm();

  const { isFormValid } = useUserCreationValidation(formData);
  const { isCreating, createUser: createUserSubmission } = useUserCreationSubmission();

  const createUser = async (): Promise<string | null> => {
    return await createUserSubmission(formData, isFormValid, resetForm);
  };

  return {
    formData,
    isCreating,
    isFormValid,
    handleInputChange,
    createUser,
  };
};
