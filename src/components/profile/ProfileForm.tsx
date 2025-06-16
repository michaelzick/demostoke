
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RoleSelect } from "@/components/ui/role-select";

interface ProfileFormProps {
  name: string;
  email: string;
  role: string;
  onNameChange: (value: string) => void;
  onRoleChange: (value: string) => void;
}

export const ProfileForm = ({
  name,
  email,
  role,
  onNameChange,
  onRoleChange,
}: ProfileFormProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          value={email}
          disabled
          className="bg-muted"
        />
        <p className="text-xs text-muted-foreground">
          Email cannot be changed. Contact support for assistance.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Your Role</Label>
        <RoleSelect
          id="role"
          value={role}
          onValueChange={onRoleChange}
          placeholder="Select Your Role"
        />
        <p className="text-xs text-muted-foreground">
          This role will be used for all gear you list on the platform.
        </p>
      </div>
    </div>
  );
};
