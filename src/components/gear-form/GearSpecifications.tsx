
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect } from "react";

interface GearSpecificationsProps {
  measurementUnit: string;
  setMeasurementUnit: (value: string) => void;
  dimensions: {
    length: string;
    width: string;
    thickness?: string;
  };
  setDimensions: (value: { length: string; width: string; thickness?: string }) => void;
  skillLevel: string;
  setSkillLevel: (value: string) => void;
  gearType: string;
  selectedSizes?: string[];
  setSelectedSizes?: (sizes: string[]) => void;
  selectedSkillLevels?: string[];
  setSelectedSkillLevels?: (skillLevels: string[]) => void;
}

const GearSpecifications = ({
  measurementUnit,
  setMeasurementUnit,
  dimensions,
  setDimensions,
  skillLevel,
  setSkillLevel,
  gearType,
  selectedSizes = [],
  setSelectedSizes,
  selectedSkillLevels = [],
  setSelectedSkillLevels
}: GearSpecificationsProps) => {
  // Universal skill levels for all gear types
  const universalSkillLevels = ["Beginner", "Intermediate", "Advanced", "Expert"];

  const isBikeType = gearType === "mountain-bike" || gearType === "e-bike";
  const bikeSize = ["Small", "Medium", "Large", "XL", "XXL"];

  const handleSizeToggle = (size: string) => {
    if (!setSelectedSizes) return;
    
    const newSizes = selectedSizes.includes(size)
      ? selectedSizes.filter(s => s !== size)
      : [...selectedSizes, size];
    
    setSelectedSizes(newSizes);
    // Update dimensions.length for backward compatibility
    setDimensions({ length: newSizes.join(", "), width: "", thickness: "" });
  };

  const handleSkillLevelToggle = (level: string) => {
    if (!setSelectedSkillLevels) return;
    
    const newSkillLevels = selectedSkillLevels.includes(level)
      ? selectedSkillLevels.filter(l => l !== level)
      : [...selectedSkillLevels, level];
    
    setSelectedSkillLevels(newSkillLevels);
    // Update skillLevel for backward compatibility
    setSkillLevel(newSkillLevels.join(", "));
  };

  return (
    <>
      {/* Measurement Unit - Only show for non-bike types */}
      {!isBikeType && (
        <div>
          <Label htmlFor="measurementUnit" className="block text-lg font-medium mb-2">
            Measurement Unit <span className="text-red-500">*</span>
          </Label>
          <Select value={measurementUnit} onValueChange={(value) => setMeasurementUnit(value)} required>
            <SelectTrigger id="measurementUnit">
              <SelectValue placeholder="Select Measurement Unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inches">Inches</SelectItem>
              <SelectItem value="centimeters">Centimeters</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Dimensions or Size */}
      {isBikeType ? (
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
      ) : (
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="length" className="block text-lg font-medium mb-2">
              Length <span className="text-red-500">*</span>
            </Label>
            <Input
              id="length"
              type="number"
              placeholder="Numbers only"
              value={dimensions.length}
              onChange={(e) =>
                setDimensions({ ...dimensions, length: e.target.value })
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="width" className="block text-lg font-medium mb-2">
              Width <span className="text-red-500">*</span>
            </Label>
            <Input
              id="width"
              type="number"
              placeholder="Numbers only"
              value={dimensions.width}
              onChange={(e) =>
                setDimensions({ ...dimensions, width: e.target.value })
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="thickness" className="block text-lg font-medium mb-2">
              Thickness
            </Label>
            <Input
              id="thickness"
              type="number"
              placeholder="Numbers only"
              value={dimensions.thickness || ""}
              onChange={(e) =>
                setDimensions({ ...dimensions, thickness: e.target.value })
              }
            />
          </div>
        </div>
      )}

      {/* Skill Level - Now using checkboxes for all gear types */}
      <div>
        <Label className="block text-lg font-medium mb-2">
          Suitable Skill Levels <span className="text-red-500">*</span>
        </Label>
        <div className="grid grid-cols-2 gap-3">
          {universalSkillLevels.map((level) => (
            <div key={level} className="flex items-center space-x-2">
              <Checkbox
                id={`skill-${level}`}
                checked={selectedSkillLevels.includes(level)}
                onCheckedChange={() => handleSkillLevelToggle(level)}
                disabled={!gearType}
              />
              <Label
                htmlFor={`skill-${level}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {level}
              </Label>
            </div>
          ))}
        </div>
        {selectedSkillLevels.length === 0 && gearType && (
          <p className="text-sm text-red-500 mt-1">Please select at least one skill level</p>
        )}
        {!gearType && (
          <p className="text-sm text-gray-500 mt-1">Select gear type first</p>
        )}
      </div>
    </>
  );
};

export default GearSpecifications;
