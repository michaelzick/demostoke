
import { Button } from "@/components/ui/button";
import { UserPlus, Loader2 } from "lucide-react";

interface UserCreationFormActionsProps {
  isCreating: boolean;
  isFormValid: boolean;
}

const UserCreationFormActions = ({ 
  isCreating, 
  isFormValid, 
}: UserCreationFormActionsProps) => {
  return (
    <>
      <div className="pt-4">
        <Button 
          type="submit" 
          disabled={!isFormValid || isCreating}
          className="flex items-center gap-2"
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
        * Required fields. Fill in all required fields and the user will receive an email confirmation.
      </p>
    </>
  );
};

export default UserCreationFormActions;
