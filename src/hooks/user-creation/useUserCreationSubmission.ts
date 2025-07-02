
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { geocodeAddress } from "@/utils/geocoding";
import { UserFormData } from "./types";

export const useUserCreationSubmission = () => {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  const createUser = async (
    formData: UserFormData,
    captchaToken: string,
    isFormValid: boolean,
    resetForm: () => void,
    resetCaptcha: () => void
  ) => {
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
      
      // Step 1: Geocode address if provided
      let locationLat: number | null = null;
      let locationLng: number | null = null;
      
      if (formData.address && formData.address.trim()) {
        console.log('Geocoding address:', formData.address);
        const geocodeResult = await geocodeAddress(formData.address);
        if (geocodeResult) {
          locationLat = geocodeResult.lat;
          locationLng = geocodeResult.lng;
          console.log('Address geocoded successfully:', { lat: locationLat, lng: locationLng });
        } else {
          console.warn('Failed to geocode address:', formData.address);
        }
      }
      
      // Step 2: Create the user account
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

      // Step 3: Wait a moment for the trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 4: Check if profile was created by trigger
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('id', authData.user.id)
        .maybeSingle();

      if (profileCheckError) {
        console.error('Error checking profile:', profileCheckError);
      }

      console.log('Profile check result:', existingProfile);

      // Step 5: Create or update the profile with form data (including geocoded coordinates)
      const profileData = {
        name: formData.name,
        role: formData.role,
        website: formData.website || null,
        phone: formData.phone || null,
        address: formData.address || null,
        location_lat: locationLat,
        location_lng: locationLng,
      };

      if (existingProfile) {
        console.log('Updating existing profile with data:', profileData);
        const { error: updateError } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', authData.user.id);

        if (updateError) {
          console.error('Profile update error:', updateError);
          throw new Error(`Failed to update profile: ${updateError.message}`);
        }
        console.log('Profile updated successfully');
      } else {
        console.log('Creating new profile (trigger may have failed) with data:', profileData);
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            ...profileData
          });

        if (insertError) {
          console.error('Profile insert error:', insertError);
          throw new Error(`Failed to create profile: ${insertError.message}`);
        }
        console.log('Profile created successfully');
      }

      // Step 6: Create user role entry with proper role mapping
      console.log('Assigning role:', formData.role);
      
      // Map frontend role values to database enum values
      let dbRole: 'admin' | 'user' = 'user'; // Default to 'user' since enum only has 'admin' and 'user'
      
      // Only admins should get admin role - for now, all manually created users get 'user' role
      // You can modify this logic based on your requirements
      if (formData.role === 'admin') {
        dbRole = 'admin';
      }
      
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: authData.user.id,
          role: dbRole
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
        console.log('Role assigned successfully:', dbRole);
      }

      // Step 7: Final verification
      const { data: finalProfile } = await supabase
        .from('profiles')
        .select('name, role, phone, address, website, location_lat, location_lng')
        .eq('id', authData.user.id)
        .single();

      console.log('Final profile verification:', finalProfile);

      const locationInfo = locationLat && locationLng 
        ? ` Address geocoded to coordinates: ${locationLat.toFixed(4)}, ${locationLng.toFixed(4)}.`
        : formData.address 
          ? ' Address provided but geocoding failed.'
          : '';

      toast({
        title: "User Created Successfully", 
        description: `New user account created for ${formData.name} (${formData.email}) with role: ${formData.role}. ${authData.user.email_confirmed_at ? 'Email confirmed.' : 'They will need to confirm their email address.'}${locationInfo}`,
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
    isCreating,
    createUser,
  };
};
