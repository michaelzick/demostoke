
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface UserContactFieldsProps {
  formData: {
    phone: string;
    address: string;
  };
  isCreating: boolean;
  onInputChange: (field: string, value: string) => void;
}

const UserContactFields = ({ formData, isCreating, onInputChange }: UserContactFieldsProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number (Not Working Here)</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => onInputChange('phone', e.target.value)}
          placeholder="Enter phone number"
          disabled={isCreating}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address (Not Working Here)</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => onInputChange('address', e.target.value)}
          placeholder="Enter full address"
          disabled={isCreating}
          className="min-h-[80px]"
        />
      </div>
    </>
  );
};

export default UserContactFields;
