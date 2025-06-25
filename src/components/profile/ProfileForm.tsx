
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
  about: string;
  website?: string;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onAddressChange: (value: string) => void;
  onAboutChange: (value: string) => void;
  onWebsiteChange?: (value: string) => void;
}

export const ProfileForm = ({
  name,
  email,
  role,
  phone,
  address,
  about,
  website = "",
  onNameChange,
  onEmailChange,
  onRoleChange,
  onPhoneChange,
  onAddressChange,
  onAboutChange,
  onWebsiteChange,
}: ProfileFormProps) => {
  const showWebsiteField = role === "retail-store" || role === "builder";

  return (
    <div className="space-y-4">
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

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
        />
      </div>

      {showWebsiteField && onWebsiteChange && (
        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            type="url"
            value={website}
            onChange={(e) => onWebsiteChange(e.target.value)}
            placeholder="https://www.yourwebsite.com"
          />
        </div>
      )}

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
        <Label htmlFor="about">About</Label>
        <Textarea
          id="about"
          value={about}
          onChange={(e) => onAboutChange(e.target.value)}
          placeholder="Tell us about yourself..."
          className="min-h-[100px]"
        />
      </div>
    </div>
  );
};
