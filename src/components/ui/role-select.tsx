
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RoleSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
}

export const RoleSelect = ({
  value,
  onValueChange,
  disabled = false,
  placeholder = "Select role",
  id,
}: RoleSelectProps) => {
  return (
    <Select 
      value={value} 
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectTrigger id={id}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="private-party">Private Party</SelectItem>
        <SelectItem value="builder">Builder (Surfboard Shaper, Etc.)</SelectItem>
        <SelectItem value="retail-store">Retail Store</SelectItem>
        <SelectItem value="retail-website">Retail Website</SelectItem>
      </SelectContent>
    </Select>
  );
};
