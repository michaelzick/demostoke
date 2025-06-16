
import { Button } from "@/components/ui/button";
import { UserPlus, Loader2 } from "lucide-react";
import HCaptcha from "@/components/HCaptcha";

interface UserCreationFormActionsProps {
  isCreating: boolean;
  isFormValid: boolean;
  onSubmit: () => void;
  onCaptchaVerify: (token: string) => void;
}

const UserCreationFormActions = ({ 
  isCreating, 
  isFormValid, 
  onSubmit, 
  onCaptchaVerify 
}: UserCreationFormActionsProps) => {
  return (
    <>
      <HCaptcha
        siteKey="e30661ca-467c-43cc-899c-be56ab28c2a2"
        onVerify={onCaptchaVerify}
      />

      <div className="pt-4">
        <Button 
          type="submit" 
          disabled={!isFormValid || isCreating}
          className="flex items-center gap-2"
          onClick={onSubmit}
        >
          {isCreating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <UserPlus className="h-4 w-4" />
          )}
          {isCreating ? "Creating User..." : "Create User"}
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        * Required fields. Complete the captcha verification and the user will receive an email confirmation.
      </p>
    </>
  );
};

export default UserCreationFormActions;
