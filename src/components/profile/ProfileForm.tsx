
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
        <Select value={role} onValueChange={onRoleChange}>
          <SelectTrigger id="role">
            <SelectValue placeholder="Select Your Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="private-party">Private Party</SelectItem>
            <SelectItem value="builder">Builder (Surfboard Shaper, Etc.)</SelectItem>
            <SelectItem value="retail-store">Retail Store</SelectItem>
            <SelectItem value="retail-website">Retail Website</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          This role will be used for all gear you list on the platform.
        </p>
      </div>
    </div>
  );
};
