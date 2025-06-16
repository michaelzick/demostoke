
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: string;
  phone: string;
  address: string;
}

export const useManualUserCreation = () => {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    role: 'private-party',
    phone: '',
    address: '',
  });

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCaptchaVerify = (token: string) => {
    setCaptchaToken(token);
  };

  const isFormValid = (): boolean => {
    return !!(formData.name && 
           formData.email && 
           formData.password && 
           formData.role &&
           captchaToken);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'private-party',
      phone: '',
      address: '',
    });
    setCaptchaToken("");
  };

  const createUser = async () => {
    if (!isFormValid()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields and complete the captcha verification.",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);

    try {
      // Use signup with captcha token
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
          },
          emailRedirectTo: window.location.origin,
          captchaToken: captchaToken
        }
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('User creation failed - no user data returned');
      }

      // Wait a moment for the user to be created and profile trigger to run
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update the profile with additional information
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          role: formData.role,
          phone: formData.phone,
          address: formData.address,
        })
        .eq('id', authData.user.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
        toast({
          title: "User Created with Warning",
          description: `User account created successfully, but profile update failed: ${profileError.message}`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "User Created Successfully",
          description: `New user account created for ${formData.name} (${formData.email}). They will need to confirm their email address.`,
        });
      }

      resetForm();

    } catch (error: any) {
      console.error('Error creating user:', error);
      
      // Handle specific error cases
      if (error.message?.includes('User already registered')) {
        toast({
          title: "User Already Exists",
          description: "A user with this email address already exists.",
          variant: "destructive"
        });
      } else if (error.message?.includes('captcha')) {
        toast({
          title: "Captcha Verification Failed",
          description: "Please complete the captcha verification and try again.",
          variant: "destructive"
        });
        setCaptchaToken(""); // Reset captcha on failure
      } else {
        toast({
          title: "Error Creating User",
          description: error.message || "Failed to create user account. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsCreating(false);
    }
  };

  return {
    formData,
    isCreating,
    captchaToken,
    isFormValid,
    handleInputChange,
    handleCaptchaVerify,
    createUser
  };
};
