
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check } from "lucide-react";
import { useManualUserCreation } from "@/hooks/useManualUserCreation";
import { useAuth } from "@/helpers";
import UserBasicInfoFields from "./UserBasicInfoFields";
import UserContactFields from "./UserContactFields";
import UserCreationFormActions from "./UserCreationFormActions";

const ManualUserCreationSection = () => {
  const { user } = useAuth();
  const {
    formData,
    isCreating,
    isFormValid,
    shouldResetCaptcha,
    handleInputChange,
    handleCaptchaVerify,
    createUser,
  } = useManualUserCreation();

  const [createdUserId, setCreatedUserId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = await createUser();
    if (userId) {
      setCreatedUserId(userId);
      setCopied(false);
    }
  };

  const handleCopy = async () => {
    if (createdUserId) {
      await navigator.clipboard.writeText(createdUserId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Create User Manually</CardTitle>
          <CardDescription>
            Add a new user account with profile information. Complete the captcha verification and the user will receive an email confirmation.
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
              role={formData.role}
              isCreating={isCreating}
              onInputChange={handleInputChange}
            />

            <UserCreationFormActions
              isCreating={isCreating}
              isFormValid={isFormValid}
              onCaptchaVerify={handleCaptchaVerify}
              shouldResetCaptcha={shouldResetCaptcha}
            />
          </form>
        </CardContent>
      </Card>

      <Dialog open={!!createdUserId} onOpenChange={(open) => { if (!open) setCreatedUserId(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>User Created Successfully</DialogTitle>
            <DialogDescription>
              The new user's UUID is shown below. Copy it for your records.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <Input
              readOnly
              value={createdUserId ?? ""}
              className="font-mono text-sm"
            />
            <Button type="button" size="icon" variant="outline" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ManualUserCreationSection;
