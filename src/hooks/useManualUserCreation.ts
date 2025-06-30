
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
      console.log('Starting user creation process...');
      
      // Step 1: Create the user account
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
        console.error('Auth signup error:', authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error('User creation failed - no user data returned');
      }

      console.log('User created successfully:', authData.user.id);

      // Step 2: Wait a moment for the trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 3: Check if profile was created by trigger
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('id', authData.user.id)
        .maybeSingle();

      if (profileCheckError) {
        console.error('Error checking profile:', profileCheckError);
      }

      console.log('Profile check result:', existingProfile);

      // Step 4: Create or update the profile with form data
      if (existingProfile) {
        console.log('Updating existing profile...');
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
          throw new Error(`Failed to update profile: ${updateError.message}`);
        }
        console.log('Profile updated successfully');
      } else {
        console.log('Creating new profile (trigger may have failed)...');
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            name: formData.name,
            role: formData.role,
            phone: formData.phone || null,
            address: formData.address || null,
          });

        if (insertError) {
          console.error('Profile insert error:', insertError);
          throw new Error(`Failed to create profile: ${insertError.message}`);
        }
        console.log('Profile created successfully');
      }

      // Step 5: Create user role entry
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: authData.user.id,
          role: formData.role as any
        });

      if (roleError) {
        console.error('Role assignment error:', roleError);
        // Don't throw here as the user was created successfully
        toast({
          title: "User Created with Warning",
          description: `User account created but role assignment failed. User: ${formData.name} (${formData.email})`,
          variant: "destructive"
        });
      } else {
        console.log('Role assigned successfully');
      }

      // Step 6: Final verification
      const { data: finalProfile } = await supabase
        .from('profiles')
        .select('name, role, phone, address')
        .eq('id', authData.user.id)
        .single();

      console.log('Final profile verification:', finalProfile);

      toast({
        title: "User Created Successfully",
        description: `New user account created for ${formData.name} (${formData.email}) with role: ${formData.role}. ${authData.user.email_confirmed_at ? 'Email confirmed.' : 'They will need to confirm their email address.'}`,
      });

      resetForm();

    } catch (error: any) {
      console.error('Error in user creation process:', error);
      
      resetCaptcha();
      
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
          description: error.message || "Failed to create user account. Check the console for details.",
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
