
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

  const handleSelectAll = () => {
    const allSelected = selectedSizes.length === bikeSize.length;
    const newSizes = allSelected ? [] : [...bikeSize];
    setSelectedSizes(newSizes);
    // Update dimensions.length for backward compatibility
    setDimensions({ length: newSizes.join(", "), width: "", thickness: "" });
  };

  const allSelected = selectedSizes.length === bikeSize.length;
  const someSelected = selectedSizes.length > 0 && selectedSizes.length < bikeSize.length;

  return (
    <div>
      <Label className="block text-lg font-medium mb-2">
        Available Sizes <span className="text-red-500">*</span>
      </Label>
      
      {/* Select All checkbox */}
      <div className="flex items-center space-x-2 mb-3 pb-2 border-b">
        <Checkbox
          id="select-all-sizes"
          checked={allSelected}
          ref={(el) => {
            if (el) el.indeterminate = someSelected;
          }}
          onCheckedChange={handleSelectAll}
        />
        <Label
          htmlFor="select-all-sizes"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Select All
        </Label>
      </div>

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
