
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
      const categoryAssets: Record<string, { avatar_url: string; hero_image_url: string }> = {
        'surfboards': {
          avatar_url: 'https://qtlhqsqanbxgfbcjigrl.supabase.co/storage/v1/object/public/profile-images/73de4049-7ffd-45cd-868b-c2d0076107b3/profile-1752863282257.png',
          hero_image_url: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        },
        'snowboards': {
          avatar_url: 'https://qtlhqsqanbxgfbcjigrl.supabase.co/storage/v1/object/public/profile-images/c5b450a8-7414-463b-b863-d78698fd0f95/profile-1752636842828.png',
          hero_image_url: 'https://images.unsplash.com/photo-1590461283969-47fedf408cfd?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        },
        'skis': {
          avatar_url: 'https://qtlhqsqanbxgfbcjigrl.supabase.co/storage/v1/object/public/profile-images/7ef925ac-4b8f-496c-b4d9-10895164f03c/profile-1769637319540.png',
          hero_image_url: 'https://images.unsplash.com/photo-1509791413599-93ba127a66b7?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        },
        'mountain-bikes': {
          avatar_url: 'https://qtlhqsqanbxgfbcjigrl.supabase.co/storage/v1/object/public/profile-images/ad2ad153-bb35-4e88-bfb0-d0d4f85ba62f/profile-1752637760487.png',
          hero_image_url: 'https://images.unsplash.com/photo-1506316940527-4d1c138978a0?q=80&w=3512&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        },
      };

      const categoryImages = formData.role === 'retail-store' && formData.gearCategory
        ? categoryAssets[formData.gearCategory] || {}
        : {};

      const profileData: Record<string, unknown> = {
        name: formData.name,
        website: formData.website || null,
        phone: formData.phone || null,
        address: formData.address || null,
        about: formData.about || null,
        location_lat: locationLat,
        location_lng: locationLng,
        ...categoryImages,
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

      // Step 6: Create user role entry with proper role mapping BEFORE user creation
      // This prevents the trigger from creating a default role
      console.log('Assigning role:', formData.role);
      
      // Map frontend role values to database enum values
      let dbRole: 'admin' | 'user' = 'user'; // Default to 'user' since enum only has 'admin' and 'user'
      
      // Only admins should get admin role - for now, all manually created users get 'user' role
      // You can modify this logic based on your requirements
      if (formData.role === 'admin') {
        dbRole = 'admin';
      }
      
      // Insert the role IMMEDIATELY after user creation to prevent trigger override
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: dbRole,
          display_role: formData.role
        });

      if (roleError || !authData.session) {
        console.error('Role assignment error:', roleError);
        try {
          const res = await fetch(
            'https://qtlhqsqanbxgfbcjigrl.supabase.co/functions/v1/set-user-display-role',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ user_id: authData.user.id, display_role: formData.role })
            });
          if (!res.ok) {
            console.error('Edge function role update failed', await res.text());
          }
        } catch (e) {
          console.error('Edge function role update exception', e);
        }

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
        .select('name, phone, address, website, location_lat, location_lng')
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

    } catch (error: unknown) {
      console.error('Error in user creation process:', error);

      resetCaptcha();

      const message = error instanceof Error ? error.message : '';

      if (message.includes('User already registered')) {
        toast({
          title: "User Already Exists",
          description: "A user with this email address already exists.",
          variant: "destructive"
        });
      } else if (message.includes('Password should be at least 6 characters')) {
        toast({
          title: "Password Too Short",
          description: "Password must be at least 6 characters long.",
          variant: "destructive"
        });
      } else if (message.includes('captcha')) {
        toast({
          title: "Captcha Verification Failed",
          description: "Please complete the captcha verification and try again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error Creating User",
          description: message || "Failed to create user account. Check the console for details.",
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
