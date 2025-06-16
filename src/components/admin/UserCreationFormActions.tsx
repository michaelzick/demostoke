
import { Button } from "@/components/ui/button";
import { UserPlus, Loader2 } from "lucide-react";

interface UserCreationFormActionsProps {
  isCreating: boolean;
  isFormValid: boolean;
  onSubmit: () => void;
}

const UserCreationFormActions = ({ isCreating, isFormValid, onSubmit }: UserCreationFormActionsProps) => {
  return (
    <>
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
        * Required fields. The user will receive an email confirmation and must verify their email address before they can log in.
      </p>
    </>
  );
};

export default UserCreationFormActions;
