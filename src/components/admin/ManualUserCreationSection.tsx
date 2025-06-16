
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useManualUserCreation } from "@/hooks/useManualUserCreation";
import UserBasicInfoFields from "./UserBasicInfoFields";
import UserContactFields from "./UserContactFields";
import UserCreationFormActions from "./UserCreationFormActions";

const ManualUserCreationSection = () => {
  const { formData, isCreating, isFormValid, handleInputChange, createUser } = useManualUserCreation();

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    await createUser();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create User Manually</CardTitle>
        <CardDescription>
          Add a new user account with profile information. The user will receive an email confirmation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreateUser} className="space-y-4">
          <UserBasicInfoFields 
            formData={formData}
            isCreating={isCreating}
            onInputChange={handleInputChange}
          />

          <UserContactFields 
            formData={formData}
            isCreating={isCreating}
            onInputChange={handleInputChange}
          />

          <UserCreationFormActions 
            isCreating={isCreating}
            isFormValid={isFormValid()}
            onSubmit={() => createUser()}
          />
        </form>
      </CardContent>
    </Card>
  );
};

export default ManualUserCreationSection;
