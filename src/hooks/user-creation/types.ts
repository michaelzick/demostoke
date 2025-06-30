
export interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: string;
  phone: string;
  address: string;
}

export interface UserCreationState {
  isCreating: boolean;
  captchaToken: string;
  shouldResetCaptcha: boolean;
  formData: UserFormData;
}

export interface UserCreationActions {
  handleInputChange: (field: keyof UserFormData, value: string) => void;
  handleCaptchaVerify: (token: string) => void;
  resetCaptcha: () => void;
  createUser: () => Promise<void>;
}
