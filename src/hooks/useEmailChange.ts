
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { AuthService } from "@/contexts/auth/AuthService";

export const useEmailChange = () => {
  const { toast } = useToast();
  const [isChangingEmail, setIsChangingEmail] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = async (newEmail: string, currentEmail: string) => {
    if (!newEmail || newEmail.trim() === "") {
      toast({
        title: "Error",
        description: "Email address is required",
        variant: "destructive",
      });
      return false;
    }

    if (!validateEmail(newEmail)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return false;
    }

    if (newEmail === currentEmail) {
      toast({
        title: "Error",
        description: "New email must be different from current email",
        variant: "destructive",
      });
      return false;
    }

    setIsChangingEmail(true);

    try {
      await AuthService.changeEmail(newEmail);

      toast({
        title: "Email change requested",
        description: "Please check both your old and new email addresses for confirmation links. You'll need to confirm the change in both.",
      });

      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'There was an error changing your email.';
      toast({
        title: "Error changing email",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsChangingEmail(false);
    }
  };

  return {
    isChangingEmail,
    handleEmailChange,
  };
};
