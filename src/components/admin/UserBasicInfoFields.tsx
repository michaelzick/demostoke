
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RoleSelect } from "@/components/ui/role-select";

interface UserBasicInfoFieldsProps {
  formData: {
    name: string;
    email: string;
    password: string;
    role: string;
  };
  isCreating: boolean;
  onInputChange: (field: string, value: string) => void;
}

const UserBasicInfoFields = ({ formData, isCreating, onInputChange }: UserBasicInfoFieldsProps) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => onInputChange('name', e.target.value)}
            placeholder="Enter full name"
            disabled={isCreating}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => onInputChange('email', e.target.value)}
            placeholder="Enter email address"
            disabled={isCreating}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="password">Password *</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => onInputChange('password', e.target.value)}
            placeholder="Enter password"
            disabled={isCreating}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role *</Label>
          <RoleSelect
            id="role"
            value={formData.role}
            onValueChange={(value) => onInputChange('role', value)}
            disabled={isCreating}
            placeholder="Select user role"
          />
        </div>
      </div>
    </>
  );
};

export default UserBasicInfoFields;
