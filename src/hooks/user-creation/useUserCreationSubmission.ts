import { useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserFormData } from "./types";

const ADMIN_CREATE_USER_FUNCTION_URL =
  "https://qtlhqsqanbxgfbcjigrl.supabase.co/functions/v1/admin-create-user";

export const useUserCreationSubmission = () => {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const isCreatingRef = useRef(false);

  const createUser = async (
    formData: UserFormData,
    isFormValid: boolean,
    resetForm: () => void,
  ): Promise<string | null> => {
    if (formData.password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      });
      return null;
    }

    if (!isFormValid) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return null;
    }

    if (isCreatingRef.current) {
      console.warn("User creation is already in progress");
      return null;
    }

    isCreatingRef.current = true;
    setIsCreating(true);

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        throw new Error("You must be signed in as an admin to create users.");
      }

      const response = await fetch(ADMIN_CREATE_USER_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
        body: JSON.stringify(formData),
      });

      const responseBody = await response.json().catch(() => null) as {
        user_id?: string;
        error?: string;
        location_geocoded?: boolean;
      } | null;

      if (!response.ok) {
        throw new Error(
          (typeof responseBody?.error === "string" && responseBody.error) ||
            "Failed to create user account.",
        );
      }

      if (!responseBody?.user_id) {
        throw new Error("User creation failed - no user ID returned");
      }

      const locationInfo = formData.address
        ? responseBody.location_geocoded
          ? " Address geocoded successfully."
          : " Address provided but geocoding failed."
        : "";

      toast({
        title: "User Created Successfully",
        description: `New user account created for ${formData.name} (${formData.email}) with role: ${formData.role}. Email confirmed.${locationInfo}`,
      });

      resetForm();
      return responseBody.user_id;

    } catch (error: unknown) {
      console.error('Error in user creation process:', error);

      const message = error instanceof Error ? error.message : '';

      if (message.includes('User already registered')) {
        toast({
          title: "User Already Exists",
          description: "A user with this email address already exists.",
          variant: "destructive"
        });
      } else if (message.includes('already been registered')) {
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
      } else if (message.includes('Unauthorized') || message.includes('Forbidden')) {
        toast({
          title: "Admin Access Required",
          description: "You must be signed in with an admin account to create users.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error Creating User",
          description: message || "Failed to create user account. Check the console for details.",
          variant: "destructive"
        });
      }
      return null;
    } finally {
      isCreatingRef.current = false;
      setIsCreating(false);
    }
  };

  return {
    isCreating,
    createUser,
  };
};
