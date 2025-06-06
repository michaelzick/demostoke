
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProfileFormProps {
  name: string;
  email: string;
  role: string;
  about: string;
  onNameChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onAboutChange: (value: string) => void;
}

export const ProfileForm = ({
  name,
  email,
  role,
  about,
  onNameChange,
  onRoleChange,
  onAboutChange,
}: ProfileFormProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Your full name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            disabled
            className="bg-muted"
          />
          <p className="text-sm text-muted-foreground">
            Email cannot be changed here
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Account Type</Label>
        <Select value={role} onValueChange={onRoleChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select your account type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="private-party">Private Party</SelectItem>
            <SelectItem value="shop-owner">Shop Owner</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="about">About</Label>
        <Textarea
          id="about"
          value={about}
          onChange={(e) => onAboutChange(e.target.value)}
          placeholder="Tell others about yourself, your experience with gear, or anything you'd like to share..."
          className="min-h-[100px]"
        />
        <p className="text-sm text-muted-foreground">
          This information will be visible on your public profile
        </p>
      </div>
    </div>
  );
};
