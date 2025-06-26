
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface SizeSpecificationsProps {
  size: string;
  setSize: (size: string) => void;
}

const SizeSpecifications = ({
  size,
  setSize
}: SizeSpecificationsProps) => {
  return (
    <div>
      <Label htmlFor="size" className="block text-lg font-medium mb-2">
        Size <span className="text-red-500">*</span>
      </Label>
      <Input
        id="size"
        type="text"
        value={size}
        onChange={(e) => setSize(e.target.value)}
        placeholder="e.g., 5'9, 5'9 x 2.25 x 1.5, Large, 180cm"
        className="w-full"
        required
      />
      <p className="text-sm text-gray-600 mt-1">
        Enter the size or dimensions in any format (e.g., 5'9, 5'9 x 2.25 x 1.5, Large, 180cm)
      </p>
    </div>
  );
};

export default SizeSpecifications;
