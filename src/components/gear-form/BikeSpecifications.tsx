
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface BikeSpecificationsProps {
  selectedSizes: string[];
  setSelectedSizes: (sizes: string[]) => void;
  setDimensions: (value: { length: string; width: string; thickness?: string }) => void;
}

const BikeSpecifications = ({
  selectedSizes,
  setSelectedSizes,
  setDimensions
}: BikeSpecificationsProps) => {
  const bikeSize = ["Small", "Medium", "Large", "XL", "XXL"];

  const handleSizeToggle = (size: string) => {
    const newSizes = selectedSizes.includes(size)
      ? selectedSizes.filter(s => s !== size)
      : [...selectedSizes, size];
    
    setSelectedSizes(newSizes);
    // Update dimensions.length for backward compatibility
    setDimensions({ length: newSizes.join(", "), width: "", thickness: "" });
  };

  return (
    <div>
      <Label className="block text-lg font-medium mb-2">
        Available Sizes <span className="text-red-500">*</span>
      </Label>
      <div className="grid grid-cols-2 gap-3">
        {bikeSize.map((size) => (
          <div key={size} className="flex items-center space-x-2">
            <Checkbox
              id={`size-${size}`}
              checked={selectedSizes.includes(size)}
              onCheckedChange={() => handleSizeToggle(size)}
            />
            <Label
              htmlFor={`size-${size}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {size}
            </Label>
          </div>
        ))}
      </div>
      {selectedSizes.length === 0 && (
        <p className="text-sm text-red-500 mt-1">Please select at least one size</p>
      )}
    </div>
  );
};

export default BikeSpecifications;
