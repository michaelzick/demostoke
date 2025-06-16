
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RoleSelect } from "@/components/ui/role-select";

interface ProfileFormProps {
  name: string;
  email: string;
  role: string;
  phone: string;
  address: string;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onAddressChange: (value: string) => void;
}

export const ProfileForm = ({
  name,
  email,
  role,
  phone,
  address,
  onNameChange,
  onEmailChange,
  onRoleChange,
  onPhoneChange,
  onAddressChange,
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
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Changing your email will require confirmation from both your old and new email addresses.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          placeholder="Enter your phone number"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          placeholder="Enter your address"
        />
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
