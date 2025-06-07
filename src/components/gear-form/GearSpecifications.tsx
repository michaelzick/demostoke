
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
}

const GearSpecifications = ({
  measurementUnit,
  setMeasurementUnit,
  dimensions,
  setDimensions,
  skillLevel,
  setSkillLevel,
  gearType
}: GearSpecificationsProps) => {
  const skillLevels = {
    snowboard: ["Beginner", "Intermediate", "Advanced", "Park Rider"],
    skis: ["Beginner", "Intermediate", "Advanced", "Park Rider"],
    surfboard: ["Beginner", "Intermediate", "Advanced", "All Levels"],
    sup: ["Flat Water", "Surf", "Racing", "Yoga"],
    "mountain-bike": ["Beginner", "Intermediate", "Advanced", "Expert"],
  };

  // Reset skill level if it's not valid for the current gear type
  useEffect(() => {
    if (gearType && skillLevel) {
      const validLevels = skillLevels[gearType as keyof typeof skillLevels] || [];
      if (!validLevels.includes(skillLevel)) {
        console.log('Resetting skill level - not valid for gear type:', gearType, skillLevel);
        setSkillLevel("");
      }
    }
  }, [gearType, skillLevel, setSkillLevel]);

  console.log('GearSpecifications render - gearType:', gearType, 'skillLevel:', skillLevel);

  const isMountainBike = gearType === "mountain-bike";

  return (
    <>
      {/* Measurement Unit - Only show for non-mountain bikes */}
      {!isMountainBike && (
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
      {isMountainBike ? (
        <div>
          <Label htmlFor="bikeSize" className="block text-lg font-medium mb-2">
            Size <span className="text-red-500">*</span>
          </Label>
          <Select 
            value={dimensions.length} 
            onValueChange={(value) => setDimensions({ ...dimensions, length: value })} 
            required
          >
            <SelectTrigger id="bikeSize">
              <SelectValue placeholder="Select Bike Size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Small">Small</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Large">Large</SelectItem>
              <SelectItem value="XL">XL</SelectItem>
              <SelectItem value="XXL">XXL</SelectItem>
            </SelectContent>
          </Select>
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

      {/* Skill Level */}
      <div>
        <Label htmlFor="skillLevel" className="block text-lg font-medium mb-2">
          Skill Level <span className="text-red-500">*</span>
        </Label>
        <Select
          key={`${gearType}-${skillLevel}`}
          value={skillLevel}
          onValueChange={(value) => {
            console.log('Skill level changed:', value);
            setSkillLevel(value);
          }}
          disabled={!gearType}
          required
        >
          <SelectTrigger id="skillLevel">
            <SelectValue placeholder={
              gearType ? "Select Skill Level" : "Select Gear Type First"
            } />
          </SelectTrigger>
          <SelectContent>
            {gearType &&
              skillLevels[gearType as keyof typeof skillLevels]?.map(
                (level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                )
              )}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default GearSpecifications;
