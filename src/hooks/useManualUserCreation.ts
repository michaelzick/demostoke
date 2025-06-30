
import { useState, useMemo } from "react";
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
  const [shouldResetCaptcha, setShouldResetCaptcha] = useState(false);
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
    setShouldResetCaptcha(false);
  };

  const isFormValid = useMemo((): boolean => {
    return !!(formData.name && 
           formData.email && 
           formData.password && 
           formData.password.length >= 6 &&
           formData.role &&
           captchaToken);
  }, [formData.name, formData.email, formData.password, formData.role, captchaToken]);

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
    setShouldResetCaptcha(true);
  };

  const resetCaptcha = () => {
    setCaptchaToken("");
    setShouldResetCaptcha(true);
  };

  const createUser = async () => {
    // Validate password length
    if (formData.password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      });
      resetCaptcha();
      return;
    }

    if (!isFormValid) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields and complete the captcha verification.",
        variant: "destructive"
      });
      resetCaptcha();
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

      console.log('User created successfully:', authData.user.id);

      // Wait a moment for the trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update the profile with additional information from the form
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          role: formData.role,
          phone: formData.phone || null,
          address: formData.address || null,
        })
        .eq('id', authData.user.id);

      if (updateError) {
        console.error('Profile update error:', updateError);
        // Don't throw here - the user was created successfully
        toast({
          title: "User Created with Warning",
          description: `User account created successfully, but some profile information may not have been saved. User: ${formData.name} (${formData.email})`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "User Created Successfully",
          description: `New user account created for ${formData.name} (${formData.email}) with role: ${formData.role}. They will need to confirm their email address.`,
        });
      }

      resetForm();

    } catch (error: any) {
      console.error('Error creating user:', error);
      
      // Reset captcha on any error to allow retry
      resetCaptcha();
      
      // Handle specific error cases
      if (error.message?.includes('User already registered')) {
        toast({
          title: "User Already Exists",
          description: "A user with this email address already exists.",
          variant: "destructive"
        });
      } else if (error.message?.includes('Password should be at least 6 characters')) {
        toast({
          title: "Password Too Short",
          description: "Password must be at least 6 characters long.",
          variant: "destructive"
        });
      } else if (error.message?.includes('captcha')) {
        toast({
          title: "Captcha Verification Failed",
          description: "Please complete the captcha verification and try again.",
          variant: "destructive"
        });
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
    shouldResetCaptcha,
    isFormValid,
    handleInputChange,
    handleCaptchaVerify,
    createUser,
    resetCaptcha
  };
};
