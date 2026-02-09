
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UserContactFieldsProps {
  formData: {
    website: string;
    phone: string;
    address: string;
    about: string;
    gearCategory: string;
  };
  role: string;
  isCreating: boolean;
  onInputChange: (field: string, value: string) => void;
}

const GEAR_CATEGORIES = [
  { value: 'surfboards', label: 'Surfboards' },
  { value: 'snowboards', label: 'Snowboards' },
  { value: 'skis', label: 'Skis' },
  { value: 'mountain-bikes', label: 'Mountain Bikes' },
];

const UserContactFields = ({ formData, role, isCreating, onInputChange }: UserContactFieldsProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="about">About <span className="text-muted-foreground text-xs">(optional)</span></Label>
        <Textarea
          id="about"
          value={formData.about}
          onChange={(e) => onInputChange('about', e.target.value)}
          placeholder="Brief description about this user or business"
          disabled={isCreating}
          className="min-h-[80px]"
        />
      </div>

      {role === 'retail-store' && (
        <div className="space-y-2">
          <Label htmlFor="gearCategory">
            Gear Category <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.gearCategory}
            onValueChange={(value) => onInputChange('gearCategory', value)}
            disabled={isCreating}
          >
            <SelectTrigger id="gearCategory">
              <SelectValue placeholder="Select a gear category" />
            </SelectTrigger>
            <SelectContent>
              {GEAR_CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          type="url"
          value={formData.website}
          onChange={(e) => onInputChange('website', e.target.value)}
          placeholder="https://www.example.com"
          disabled={isCreating}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
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
        <Label htmlFor="address">Address</Label>
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
